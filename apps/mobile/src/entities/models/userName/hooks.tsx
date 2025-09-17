// src/entities/models/userName/hooks.tsx
import { useCallback, useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useModelForm } from "@src/entities/core/hooks";
import { userNameService } from "@src/entities/models/userName/service";
import {
    initialUserNameForm,
    toUserNameForm,
    toUserNameCreate,
    toUserNameUpdate,
} from "@src/entities/models/userName/form";
import type {
    UserNameFormType,
    UserNameType,
    UserNameTypeUpdateInput,
} from "@src/entities/models/userName/types";
import { emitUserNameUpdated } from "./bus";

type Extras = { userNames: UserNameType[] };

export function useUserNameForm(userName: UserNameType | null) {
    const { user } = useAuthenticator();
    const sub = user?.userId ?? user?.username ?? null;

    const [userNameId, setUserNameId] = useState<string | null>(userName?.id ?? sub ?? null);

    // Comparateur pour un dirty "propre"
    const isEqual = useCallback(
        (a: UserNameFormType, b: UserNameFormType) =>
            (a.userName ?? "").trim() === (b.userName ?? "").trim(),
        []
    );

    // Fournir load() pour que refresh() refonctionne partout
    const load = useCallback(async () => {
        const id = userNameId ?? sub;
        if (!id) return null;
        const { data } = await userNameService.get({ id });
        return data ? toUserNameForm(data, [], []) : null;
    }, [userNameId, sub]);

    const modelForm = useModelForm<UserNameFormType, Extras>({
        initialForm: initialUserNameForm,
        initialExtras: { userNames: [] },
        load, // ✅ permet refresh()
        create: async (form) => {
            const id = sub;
            if (!id) throw new Error("ID utilisateur introuvable");
            const { data, errors } = await userNameService.create({
                id,
                ...toUserNameCreate(form),
            });
            if (!data)
                throw new Error(errors?.[0]?.message ?? "Erreur lors de la création du pseudo");
            setUserNameId(data.id);
            emitUserNameUpdated();
            return data.id;
        },
        update: async (form) => {
            const id = userNameId ?? sub;
            if (!id) throw new Error("ID utilisateur introuvable");
            const { data, errors } = await userNameService.update({
                id,
                ...toUserNameUpdate(form),
            });
            if (!data)
                throw new Error(errors?.[0]?.message ?? "Erreur lors de la mise à jour du pseudo");
            setUserNameId(data.id);
            emitUserNameUpdated();
            return data.id;
        },
        autoLoad: true, // ✅ hydrate si id dispo
        autoLoadExtras: false,
        isEqual, // ✅ dirty stable
    });

    const { setForm, setMode, setExtras, reset, patchForm, extras, refresh, adoptInitial } =
        modelForm;

    // Liste (cohérence avec author/tag/section)
    const fetchUserNames = useCallback(async () => {
        const { data } = await userNameService.list();
        setExtras((e) => ({ ...e, userNames: data ?? [] }));
    }, [setExtras]);

    useEffect(() => {
        void fetchUserNames();
    }, [fetchUserNames]);

    // Hydrate depuis la prop ou l’utilisateur courant (sub)
    useEffect(() => {
        (() => {
            if (userName) {
                setUserNameId(userName.id);
                adoptInitial(toUserNameForm(userName, [], []), "edit");
                return;
            }
            if (!sub) {
                setForm(initialUserNameForm);
                setMode("create");
                setUserNameId(null);
                return;
            }
            // autoLoad + load() s'occuperont de l’hydratation
            setUserNameId(sub);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userName?.id, sub]);

    const selectById = useCallback(
        (id: string) => {
            const item = extras.userNames.find((u) => u.id === id) ?? null;
            if (item) {
                setUserNameId(item.id);
                adoptInitial(toUserNameForm(item, [], []), "edit");
            }
            return item;
        },
        [extras.userNames, adoptInitial]
    );

    const deleteEntity = useCallback(
        async (id: string) => {
            if (!window.confirm("Supprimer ce pseudo ?")) return;
            await userNameService.delete({ id });
            await fetchUserNames();
            if (userNameId === id) {
                setUserNameId(null);
                adoptInitial(initialUserNameForm, "create");
                reset();
            }
            await refresh(); // 🔄 maintenant effectif
            emitUserNameUpdated();
        },
        [userNameId, reset, fetchUserNames, refresh, adoptInitial]
    );

    // Helpers “champ par champ”
    const updateEntity = useCallback(
        async (field: keyof UserNameFormType, value: string) => {
            const id = userNameId ?? sub;
            if (!id) return;
            await userNameService.update({
                id,
                [field]: value,
            } as UserNameTypeUpdateInput & { id: string });
            patchForm({ [field]: value } as Partial<UserNameFormType>); // optimiste
            await refresh();
            emitUserNameUpdated();
        },
        [userNameId, sub, patchForm, refresh]
    );

    const clearField = useCallback(
        async (field: keyof UserNameFormType) => {
            await updateEntity(field, "");
        },
        [updateEntity]
    );

    return {
        ...modelForm,
        userNameId,
        fetchUserNames,
        selectById,
        deleteEntity,
        updateEntity,
        clearField,
    };
}
