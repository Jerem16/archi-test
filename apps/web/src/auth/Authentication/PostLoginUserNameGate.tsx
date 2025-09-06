// src/app/connexion/PostLoginUserNameGate.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useUserNameForm } from "@entities/models/userName/hooks";
import { onUserNameUpdated } from "@entities/models/userName/bus";
import type { UserNameType } from "@entities/models/userName";
import UserNameModal from "@/src/components/Profile/UserNameModal";
import { useRouter } from "next/navigation";

export default function PostLoginUserNameGate() {
    const { authStatus, user } = useAuthenticator((ctx) => [ctx.authStatus, ctx.user]);
    const router = useRouter();

    // pas obligatoire d’avoir un editingProfile ici, on peut passer null
    const [editingProfile] = useState<UserNameType | null>(null);
    const {
        form: { userName },
        refresh,
    } = useUserNameForm(editingProfile);

    const [showModal, setShowModal] = useState(false);
    const redirectedRef = useRef(false); // évite les redirections multiples

    // Quand l'utilisateur devient authentifié, on charge son userName
    useEffect(() => {
        if (authStatus === "authenticated" && user) {
            void refresh();
        } else {
            setShowModal(false);
        }
    }, [authStatus, user, refresh]);

    // Se resynchroniser si le pseudo est mis à jour ailleurs
    useEffect(() => {
        if (authStatus !== "authenticated") return;
        const unsub = onUserNameUpdated(() => {
            void refresh();
        });
        return unsub;
    }, [authStatus, refresh]);

    // Ouvrir/fermer le modal selon la présence du pseudo, puis rediriger si OK
    useEffect(() => {
        if (authStatus !== "authenticated") return;

        // pas de pseudo → on force l’ouverture du modal
        if (!userName) {
            setShowModal(true);
            return;
        }

        // pseudo présent → fermer modal et rediriger une seule fois
        setShowModal(false);

        if (!redirectedRef.current) {
            redirectedRef.current = true;

            const params =
                typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

            const raw = params?.get("redirect") ?? "/profile";
            let to = "/profile";
            try {
                const dec = decodeURIComponent(raw);
                // garde anti open-redirect : n'autoriser que les chemins internes
                to = /^\/(?!\/)/.test(dec) ? dec : "/profile";
            } catch {
                // ignore
            }

            router.replace(to);
        }
    }, [authStatus, userName, router]);

    // Tant qu'on n'est pas authentifié, on ne rend rien (la page /connexion gère le login)
    if (authStatus !== "authenticated") return null;

    // ⚠️ On suppose que UserNameModal empêche sa fermeture tant que userName est vide
    return <UserNameModal isOpen={showModal} onClose={() => setShowModal(false)} />;
}
