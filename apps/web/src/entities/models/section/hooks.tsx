/* // src/entities/models/section/hooks.tsx
import { useEffect, useCallback, useState } from "react";
import { useModelForm } from "@src/entities/core/hooks";
import { postService } from "@src/entities/models/post/service";
import { sectionService } from "@src/entities/models/section/service";
import { sectionPostService } from "@src/entities/relations/sectionPost/service";
import { initialSectionForm, toSectionForm } from "@src/entities/models/section/form";
import { type SectionFormType, type SectionType } from "@src/entities/models/section/types";
import { type PostType } from "@src/entities/models/post/types";
import { syncSectionToPosts } from "@src/entities/relations/sectionPost";
import { toggleId } from "@src/entities/core/utils";

type Extras = { posts: PostType[]; sections: SectionType[] };

export function useSectionForm(section: SectionType | null) {
    const [sectionId, setSectionId] = useState<string | null>(section?.id ?? null);

    const modelForm = useModelForm<SectionFormType, Extras>({
        initialForm: initialSectionForm,
        initialExtras: { posts: [], sections: [] },

        create: async (form) => {
            const { postIds, ...sectionInput } = form;
            void postIds;
            const { data } = await sectionService.create(sectionInput);
            if (!data) throw new Error("Erreur lors de la création de la section");
            setSectionId(data.id);
            setMessage("Nouvelle section créée avec succès.");
            return data.id;
        },

        update: async (form) => {
            if (!sectionId) throw new Error("ID de la section manquant pour la mise à jour");
            const { postIds, ...sectionInput } = form;
            void postIds;
            const { data } = await sectionService.update({ id: sectionId, ...sectionInput });
            if (!data) throw new Error("Erreur lors de la mise à jour de la section");
            setSectionId(data.id);
            setMessage("Section mise à jour avec succès.");
            return data.id;
        },

        syncRelations: async (id, form) => {
            await syncSectionToPosts(id, form.postIds);
        },
    });

    const { setForm, setExtras, setMode, refresh, setMessage, setError, extras } = modelForm;

    // Charge les extras (posts + sections)
    const listSections = useCallback(async () => {
        const { data } = await sectionService.list();
        setExtras((e) => ({ ...e, sections: data ?? [] }));
    }, [setExtras]);

    useEffect(() => {
        void (async () => {
            const { data } = await postService.list();
            setExtras((e) => ({ ...e, posts: data ?? [] }));
        })();
        void listSections();
    }, [setExtras, listSections]);

    // Hydrate le form en fonction de la section courante (édition vs création)
    useEffect(() => {
        void (async () => {
            if (section) {
                const postIds = await sectionPostService.listByParent(section.id);
                setForm(toSectionForm(section, postIds));
                setMode("edit");
                setSectionId(section.id);
            } else {
                setForm(initialSectionForm);
                setMode("create");
                setSectionId(null);
            }
        })();
    }, [section, setForm, setMode]);

    const togglePost = useCallback(
        (postId: string) => {
            setForm((prev) => ({
                ...prev,
                postIds: toggleId(prev.postIds ?? [], postId),
            }));
        },
        [setForm]
    );

    // Sélection par ID (aligne le comportement avec usePostForm)
    const selectById = useCallback(
        (id: string) => {
            const sectionItem = extras.sections.find((s) => s.id === id) ?? null;
            if (sectionItem) {
                setSectionId(id);
                void (async () => {
                    const postIds = await sectionPostService.listByParent(id);
                    setForm(toSectionForm(sectionItem, postIds));
                    setMode("edit");
                })();
            }
            return sectionItem;
        },
        [extras.sections, setForm, setMode]
    );

    // Suppression en cascade + messages + refresh (comme usePostForm)
    const deleteEntity = useCallback(
        async (id: string) => {
            if (!window.confirm("Supprimer cette section ?")) return;

            try {
                setMessage("Suppression des données relationnelles...");
                await sectionService.deleteCascade({ id });
                await listSections();

                if (sectionId === id) {
                    setSectionId(null);
                }

                setMessage("Section supprimée avec succès.");
                refresh();
            } catch (e: unknown) {
                setError(e);
                setMessage("Erreur lors de la suppression de la section.");
            }
        },
        [listSections, sectionId, refresh, setMessage, setError]
    );

    return {
        ...modelForm,
        sectionId,
        listSections,
        selectById,
        deleteEntity,
        togglePost,
    };
}
 */
