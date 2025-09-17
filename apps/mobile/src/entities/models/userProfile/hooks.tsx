// src/entities/models/userProfile/hooks.tsx
import { useCallback, useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useModelForm } from "@src/entities/core/hooks";
import { userProfileService } from "@src/entities/models/userProfile/service";
import { initialUserProfileForm, toUserProfileForm } from "@src/entities/models/userProfile/form";
import type { UserProfileFormType, UserProfileType } from "@src/entities/models/userProfile/types";

type Extras = Record<string, never>;

const fieldLabel = (field: keyof UserProfileFormType): string => field;

export function useUserProfileForm(profile: UserProfileType | null) {
    const { user } = useAuthenticator();
    const sub = user?.userId ?? user?.username ?? null;

    const [profileId, setProfileId] = useState<string | null>(profile?.id ?? sub ?? null);

    const modelForm = useModelForm<UserProfileFormType, Extras>({
        initialForm: initialUserProfileForm,
        initialExtras: {},
        create: async (form) => {
            const id = sub;
            if (!id) throw new Error("ID utilisateur introuvable");
            const { data } = await userProfileService.create({ id, ...form });
            if (!data) throw new Error("Erreur lors de la création du profil");
            setProfileId(data.id);
            return data.id;
        },
        update: async (form) => {
            const id = profileId ?? sub;
            if (!id) throw new Error("ID utilisateur introuvable");
            const { data } = await userProfileService.update({ id, ...form });
            if (!data) throw new Error("Erreur lors de la mise à jour du profil");
            setProfileId(data.id);
            return data.id;
        },
        autoLoad: false,
        autoLoadExtras: false,
    });

    const { setForm, setMode, patchForm, reset } = modelForm;

    // Hydrate depuis la prop ou l’utilisateur courant (sub)
    useEffect(() => {
        void (async () => {
            if (profile) {
                setForm(toUserProfileForm(profile));
                setMode("edit");
                setProfileId(profile.id);
                return;
            }
            const id = sub ?? null;
            if (!id) {
                setForm(initialUserProfileForm);
                setMode("create");
                setProfileId(null);
                return;
            }
            const { data } = await userProfileService.get({ id });
            if (data) {
                setForm(toUserProfileForm(data));
                setMode("edit");
                setProfileId(data.id);
            } else {
                setForm(initialUserProfileForm);
                setMode("create");
                setProfileId(id);
            }
        })();
    }, [profile, sub, setForm, setMode]);

    // Cohérence avec les autres hooks : sélection/suppression par ID
    const selectById = useCallback(
        async (id: string) => {
            const { data } = await userProfileService.get({ id });
            if (data) {
                setForm(toUserProfileForm(data));
                setMode("edit");
                setProfileId(data.id);
            }
            return data ?? null;
        },
        [setForm, setMode]
    );

    const deleteEntity = useCallback(
        async (id: string) => {
            if (!window.confirm("Supprimer ce profil ?")) return;
            await userProfileService.delete({ id });
            if (profileId === id) {
                setProfileId(null);
                reset();
            }
        },
        [profileId, reset]
    );

    // Helpers champ par champ (même esprit que toggle/updateEntity ailleurs)
    const updateEntity = useCallback(
        async (field: keyof UserProfileFormType, value: string) => {
            const id = profileId ?? sub;
            if (!id) return;
            await userProfileService.update({ id, [field]: value } as Record<
                keyof UserProfileFormType,
                string
            > & { id: string });
            patchForm({ [field]: value } as Partial<UserProfileFormType>);
        },
        [profileId, sub, patchForm]
    );

    const clearField = useCallback(
        async (field: keyof UserProfileFormType) => {
            await updateEntity(field, "");
        },
        [updateEntity]
    );

    // Petit utilitaire conservé pour compat UI existante
    const labels = useCallback((field: keyof UserProfileFormType) => fieldLabel(field), []);

    return {
        ...modelForm,
        profileId,
        selectById,
        deleteEntity,
        updateEntity,
        clearField,
        labels,
    };
}
