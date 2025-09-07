"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type FormMode = "create" | "edit";
export type FieldKey<T> = Extract<keyof T, string>;

export interface UseModelFormOptions<F extends object, E = Record<string, unknown>> {
    initialForm: F;
    initialExtras?: E;
    mode?: FormMode;

    validate?: (form: F) => Promise<boolean> | boolean;
    create: (form: F) => Promise<string>;
    update: (form: F) => Promise<string>;
    syncRelations?: (id: string, form: F) => Promise<void>;

    /** 🔄 Charge l'entité depuis la "source de vérité" (ex: GET by id/sub) */
    load?: () => Promise<F | null>;
    /** 📦 Charge et renvoie les "extras" (ex: listes pour selects) */
    loadExtras?: () => Promise<Partial<E> | void> | Partial<E> | void;

    /** Auto-exécuter load() au mount */
    autoLoad?: boolean;
    /** Auto-exécuter loadExtras() au mount */
    autoLoadExtras?: boolean;
    /** Réinitialiser le formulaire si load() renvoie null */
    resetOnNull?: boolean;

    /** ⚙️ Comparateur optionnel pour calculer `dirty` (sinon deepEqual JSON) */
    isEqual?: (a: F, b: F) => boolean;
}

export interface UseModelFormResult<F, E> {
    form: F;
    extras: E;
    mode: FormMode;

    dirty: boolean;
    saving: boolean;
    loading: boolean; // global (load + loadExtras)
    loadingExtras: boolean; // pour différencier si besoin

    error: unknown;
    setError: React.Dispatch<React.SetStateAction<unknown>>;
    message: string | null;

    setFieldValue: <K extends keyof F>(field: K, value: F[K]) => void;
    patchForm: (partial: Partial<F>) => void;

    /** Helpers de mode */
    setCreate: (next?: F) => void;
    setEdit: (next?: F) => void;

    /** Enchaîne create/update (+ syncRelations) puis refresh/load */
    submit: () => Promise<boolean>;
    reset: () => void;
    /** Annule les changements et reste dans le mode courant */
    cancelChanges: () => void;
    /** Quitte l’édition et repasse en create avec un form neuf (ou fourni) */
    exitEditMode: (next?: F) => void;

    setForm: React.Dispatch<React.SetStateAction<F>>;
    setExtras: React.Dispatch<React.SetStateAction<E>>;
    setMode: React.Dispatch<React.SetStateAction<FormMode>>;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    adoptInitial: (next: F, mode?: FormMode) => void;

    /** 🔄 Recharge depuis load() et met à jour baseline */
    refresh: () => Promise<void>;
    /** 📦 Recharge les extras */
    refreshExtras: () => Promise<void>;

    /** Petit utilitaire pour inputs texte */
    bindText: <K extends keyof F>(
        field: K
    ) => {
        value: string;
        onChange: (e: { target: { value: string } }) => void;
    };
}

function deepEqual(a: unknown, b: unknown) {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}

export default function useModelForm<
    F extends object,
    E extends Record<string, unknown> = Record<string, unknown>,
>(options: UseModelFormOptions<F, E>): UseModelFormResult<F, E> {
    const {
        initialForm,
        initialExtras,
        mode: initialMode = "create",
        validate,
        create,
        update,
        syncRelations,
        load,
        loadExtras,
        autoLoad = true,
        autoLoadExtras = true,
        resetOnNull = false,
        isEqual,
    } = options;

    const initialRef = useRef(initialForm);
    const [form, setForm] = useState<F>(initialForm);
    const [extras, setExtras] = useState<E>((initialExtras as E) ?? ({} as E));
    const [mode, setMode] = useState<FormMode>(initialMode);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingExtras, setLoadingExtras] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const [message, setMessage] = useState<string | null>(null);

    // dirty = différences par rapport à la baseline (initialRef.current)
    const dirty = useMemo(() => {
        const equals = isEqual ?? deepEqual;
        return !equals(form, initialRef.current);
    }, [form, isEqual]);

    const setFieldValue = useCallback(<K extends keyof F>(field: K, value: F[K]) => {
        setForm((f) => ({ ...f, [field]: value }));
        setMessage("Le champ a été mis à jour.");
    }, []);

    const patchForm = useCallback((partial: Partial<F>) => {
        setForm((prev) => ({ ...prev, ...partial }));
        setMessage("Les données ont été mises à jour.");
    }, []);

    const reset = useCallback(() => {
        setForm(initialRef.current);
        setMessage("Les données ont été réinitialisées.");
        setMode(initialMode);
        setError(null);
    }, [initialMode]);

    /** Annule les changements et reste dans le mode courant */
    const cancelChanges = useCallback(() => {
        setForm(initialRef.current);
        setMessage("Modifications annulées.");
        setError(null);
    }, []);

    const adoptInitial = useCallback((next: F, nextMode: FormMode = "edit") => {
        initialRef.current = next;
        setForm(next);
        setMode(nextMode);
        setError(null);
        setMessage(null);
    }, []);

    /** Quitte le mode édition → repasse en create avec un form neuf (ou fourni) */
    const exitEditMode = useCallback(
        (next?: F) => {
            adoptInitial(next ?? initialForm, "create");
            setMessage("Retour au mode création.");
        },
        [adoptInitial, initialForm]
    );

    const refresh = useCallback(async () => {
        if (!load) return;
        try {
            setLoading(true);
            const next = await load();
            if (next) {
                adoptInitial(next, "edit");
            } else if (resetOnNull) {
                adoptInitial(initialForm, "create");
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, [load, adoptInitial, initialForm, resetOnNull]);

    const refreshExtras = useCallback(async () => {
        if (!loadExtras) return;
        try {
            setLoadingExtras(true);
            const next = await loadExtras();
            if (next && typeof next === "object") {
                setExtras((prev) => ({ ...prev, ...next }));
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoadingExtras(false);
        }
    }, [loadExtras]);

    // auto-load au mount
    useEffect(() => {
        if (autoLoad && load) void refresh();
    }, [autoLoad, load, refresh]);

    // auto-loadExtras au mount
    useEffect(() => {
        if (autoLoadExtras && loadExtras) void refreshExtras();
    }, [autoLoadExtras, loadExtras, refreshExtras]);

    const setCreate = useCallback(
        (next?: F) => {
            adoptInitial(next ?? initialForm, "create");
        },
        [adoptInitial, initialForm]
    );

    const setEdit = useCallback(
        (next?: F) => {
            adoptInitial(next ?? form, "edit");
        },
        [adoptInitial, form]
    );

    const submit = useCallback(async (): Promise<boolean> => {
        setSaving(true);
        setError(null);
        try {
            if (validate) {
                const valid = await validate(form);
                if (!valid) return false;
            }
            const id = mode === "create" ? await create(form) : await update(form);
            if (syncRelations) await syncRelations(id, form);
            if (load) {
                await refresh();
            } else {
                setMode("edit");
                initialRef.current = form;
            }
            return true;
        } catch (e) {
            setError(e);
            return false;
        } finally {
            setSaving(false);
        }
    }, [form, mode, validate, create, update, syncRelations, load, refresh]);

    const bindText = useCallback(
        <K extends keyof F>(field: K) => ({
            value: String(form[field] ?? ""),
            onChange: (e: { target: { value: string } }) =>
                setFieldValue(field, e.target.value as F[K]),
        }),
        [form, setFieldValue]
    );

    return {
        form,
        extras,
        mode,
        dirty,
        saving,
        loading,
        loadingExtras,
        error,
        setError,
        message,
        setFieldValue,
        patchForm,
        setCreate,
        setEdit,
        submit,
        reset,
        cancelChanges,
        exitEditMode,
        setForm,
        setExtras,
        setMode,
        setMessage,
        adoptInitial,
        refresh,
        refreshExtras,
        bindText,
    };
}
