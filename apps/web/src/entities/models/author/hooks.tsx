/* import { useCallback, useEffect, useState } from "react";
import { useModelForm } from "@src/entities/core/hooks";
import { authorService } from "@src/entities/models/author/service";
import { initialAuthorForm, toAuthorForm } from "@src/entities/models/author/form";
import { type AuthorFormType, type AuthorType } from "@src/entities/models/author/types";

interface Extras extends Record<string, unknown> {
    authors: AuthorType[];
    loading: boolean;
}

export function useAuthorForm(author: AuthorType | null) {
    const [authorId, setAuthorId] = useState<string | null>(author?.id ?? null);

    const modelForm = useModelForm<AuthorFormType, Extras>({
        initialForm: initialAuthorForm,
        initialExtras: { authors: [], loading: true },
        create: async (form) => {
            //! DON'T DELETE
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { postIds, ...authorInput } = form;
            const { data } = await authorService.create(authorInput);
            if (!data) throw new Error("Erreur lors de la création de l'auteur");
            setAuthorId(data.id);
            return data.id;
        },
        update: async (form) => {
            if (!authorId) throw new Error("ID de l'auteur manquant pour la mise à jour");
            //! DON'T DELETE
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { postIds, ...authorInput } = form;
            const { data } = await authorService.update({
                id: authorId,
                ...authorInput,
            });
            if (!data) throw new Error("Erreur lors de la mise à jour de l'auteur");
            setAuthorId(data.id);
            return data.id;
        },
    });

    const { setExtras, setForm, setMode, extras, reset } = modelForm;

    const listAuthors = useCallback(async () => {
        setExtras((prev) => ({ ...prev, loading: true }));
        try {
            const { data } = await authorService.list();
            setExtras((prev) => ({
                ...prev,
                authors: data ?? [],
                loading: false,
            }));
        } catch {
            setExtras((prev) => ({ ...prev, loading: false }));
        }
    }, [setExtras]);

    const selectById = useCallback(
        (id: string) => {
            const authorItem = extras.authors.find((a) => a.id === id) ?? null;
            if (authorItem) {
                setForm(toAuthorForm(authorItem, []));
                setMode("edit");
                setAuthorId(id);
            }
            return authorItem;
        },
        [extras.authors, setForm, setMode]
    );

    const deleteEntity = useCallback(
        async (id: string) => {
            if (!window.confirm("Supprimer cet auteur ?")) return;
            await authorService.deleteCascade({ id });
            await listAuthors();
            if (authorId === id) {
                setAuthorId(null);
                reset();
            }
        },
        [listAuthors, authorId, reset]
    );

    useEffect(() => {
        void listAuthors();
    }, [listAuthors]);

    useEffect(() => {
        if (author) {
            setForm(toAuthorForm(author, []));
            setMode("edit");
            setAuthorId(author.id);
        } else {
            setForm(initialAuthorForm);
            setMode("create");
            setAuthorId(null);
        }
    }, [author, setForm, setMode]);

    return { ...modelForm, authorId, listAuthors, selectById, deleteEntity };
}
 */
