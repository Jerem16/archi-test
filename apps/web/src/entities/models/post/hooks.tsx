import { useEffect, useCallback, useState } from "react";
import { useModelForm } from "@src/entities/core/hooks";
import { postService } from "@src/entities/models/post/service";
import { postTagService } from "@src/entities/relations/postTag/service";
import { sectionPostService } from "@src/entities/relations/sectionPost/service";
import { authorService } from "@src/entities/models/author/service";
import { tagService } from "@src/entities/models/tag/service";
import { sectionService } from "@src/entities/models/section/service";
import { initialPostForm, toPostForm } from "@src/entities/models/post/form";
import { type PostFormType, type PostType } from "@src/entities/models/post/types";
import { type AuthorType } from "@src/entities/models/author/types";
import { type TagType } from "@src/entities/models/tag/types";
import { type SectionType } from "@src/entities/models/section/types";
import { syncPostToTags } from "@src/entities/relations/postTag";
import { syncPostToSections } from "@src/entities/relations/sectionPost";
import { toggleId } from "@src/entities/core/utils";

interface Extras extends Record<string, unknown> {
    authors: AuthorType[];
    tags: TagType[];
    sections: SectionType[];
    posts: PostType[];
}

export function usePostForm(post: PostType | null) {
    const [postId, setPostId] = useState<string | null>(post?.id ?? null);

    const modelForm = useModelForm<PostFormType, Extras>({
        initialForm: initialPostForm,
        initialExtras: { authors: [], tags: [], sections: [], posts: [] },

        validate: (form) => {
            if (!form.authorId) {
                alert("Veuillez sélectionner un auteur.");
                return false;
            }
            return true;
        },

        create: async (form) => {
            //! DON'T DELETE no-unused-vars
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tagIds, sectionIds, ...postInput } = form;
            const { data } = await postService.create({
                ...postInput,
                seo: form.seo,
            });
            if (!data) throw new Error("Erreur lors de la création de l'article");
            setPostId(data.id);
            setMessage("Nouvel article créé avec succès.");
            return data.id;
        },

        update: async (form) => {
            if (!postId) {
                throw new Error("ID du post manquant pour la mise à jour");
            }
            //! DON'T DELETE no-unused-vars
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { tagIds, sectionIds, ...postInput } = form;
            const { data } = await postService.update({
                id: postId,
                ...postInput,
                seo: form.seo,
            });
            if (!data) throw new Error("Erreur lors de la mise à jour de l'article");
            setPostId(data.id);
            setMessage("Article mis à jour avec succès.");
            return data.id;
        },

        syncRelations: async (id, form) => {
            await Promise.all([
                syncPostToTags(id, form.tagIds),
                syncPostToSections(id, form.sectionIds),
            ]);
        },
    });

    const {
        setForm,
        setExtras,
        setMode,
        extras,
        refresh,
        setMessage,
        setError,
        exitEditMode: baseExitEditMode,
    } = modelForm;

    const listPosts = useCallback(async () => {
        const { data } = await postService.list();
        setExtras((e) => ({ ...e, posts: data ?? [] }));
    }, [setExtras]);

    useEffect(() => {
        void (async () => {
            const [a, t, s] = await Promise.all([
                authorService.list(),
                tagService.list(),
                sectionService.list(),
            ]);
            setExtras((e) => ({
                ...e,
                authors: a.data ?? [],
                tags: t.data ?? [],
                sections: s.data ?? [],
            }));
        })();
        void listPosts();
    }, [setExtras, listPosts]);

    useEffect(() => {
        void (async () => {
            if (post) {
                const [tagIds, sectionIds] = await Promise.all([
                    postTagService.listByParent(post.id),
                    sectionPostService.listByChild(post.id),
                ]);
                setForm(toPostForm(post, tagIds, sectionIds));
                setMode("edit");
                setPostId(post.id);
            } else {
                setForm(initialPostForm);
                setMode("create");
                setPostId(null);
            }
        })();
    }, [post, setForm, setMode]);

    function toggleTag(tagId: string) {
        setForm((prev) => ({
            ...prev,
            tagIds: toggleId(prev.tagIds ?? [], tagId),
        }));
    }

    function toggleSection(sectionId: string) {
        setForm((prev) => ({
            ...prev,
            sectionIds: toggleId(prev.sectionIds ?? [], sectionId),
        }));
    }

    const selectById = useCallback(
        (id: string) => {
            const postItem = extras.posts.find((p) => p.id === id) ?? null;
            if (postItem) {
                setPostId(id);
                void (async () => {
                    const [tagIds, sectionIds] = await Promise.all([
                        postTagService.listByParent(id),
                        sectionPostService.listByChild(id),
                    ]);
                    setForm(toPostForm(postItem, tagIds, sectionIds));
                    setMode("edit");
                })();
            }
            return postItem;
        },
        [extras.posts, setForm, setMode]
    );

    const deleteEntity = useCallback(
        async (id: string) => {
            if (!window.confirm("Supprimer cet article ?")) return;

            try {
                setMessage("Suppression des données relationnelles...");
                await postService.deleteCascade({ id });
                await listPosts();

                if (postId === id) {
                    setPostId(null);
                }

                setMessage("Article supprimé avec succès.");
                refresh();
            } catch (e: unknown) {
                setError(e);
                setMessage("Erreur lors de la suppression de l’article.");
            }
        },
        [listPosts, postId, refresh, setError, setMessage]
    );

    //* Sortie d’édition spécifique au Post : nettoie postId et repasse en create
    const exitEditMode = useCallback(() => {
        setPostId(null);
        baseExitEditMode(initialPostForm);
    }, [baseExitEditMode]);

    return {
        ...modelForm,
        postId,
        listPosts,
        selectById,
        deleteEntity,
        toggleTag,
        toggleSection,
        exitEditMode,
    };
}
