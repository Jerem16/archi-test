import { a, defineData, type ClientSchema } from "@aws-amplify/backend";

const schema = a.schema({
    Todo: a
        .model({
            content: a.string(),
            comments: a.hasMany("Comment", "todoId"),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    Comment: a
        .model({
            id: a.id().required(),
            content: a.string().required(),
            todoId: a.id(),
            todo: a.belongsTo("Todo", "todoId"),
            postId: a.id(),
            post: a.belongsTo("Post", "postId"),
            userNameId: a.id().required(),
            userName: a.belongsTo("UserName", "userNameId"),
            // owner: a.string(), // optionnel si tu veux être explicite
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]), // ⬅️ ajout
            allow.owner().to(["create", "update", "delete", "read"]),
            allow.group("ADMINS").to(["read", "update", "delete"]),
        ]),

    UserName: a
        .model({
            id: a.id().required(),
            userName: a.string().required(),
            comments: a.hasMany("Comment", "userNameId"),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]), // tout le monde peut voir le userName
            allow.authenticated().to(["read"]),
            allow.owner().to(["create", "update", "delete"]), // seul l’owner modifie son pseudo
            allow.group("ADMINS").to(["read", "update", "delete"]), // admin peut aussi gérer
        ]),

    UserProfile: a
        .model({
            id: a.id().required(),
            firstName: a.string(),
            familyName: a.string(),
            address: a.string(),
            postalCode: a.string(),
            city: a.string(),
            country: a.string(),
            phoneNumber: a.string(),
        })
        .authorization((allow) => [allow.owner()]),

    Author: a
        .model({
            id: a.id().required(),
            authorName: a.string().required(),
            bio: a.string(),
            email: a.string(),
            avatar: a.string(),
            posts: a.hasMany("Post", "authorId"),
            order: a.integer(),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    Seo: a.customType({
        title: a.string(),
        description: a.string(),
        image: a.string(),
    }),

    Section: a
        .model({
            id: a.id().required(),
            title: a.string().required(),
            slug: a.string().required(),
            description: a.string(),
            order: a.integer(),
            posts: a.hasMany("SectionPost", "sectionId"),
            seo: a.ref("Seo"),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    Post: a
        .model({
            id: a.id().required(),
            slug: a.string().required(),
            title: a.string().required(),
            excerpt: a.string(),
            content: a.string(),
            videoUrl: a.string(),
            authorId: a.id().required(),
            author: a.belongsTo("Author", "authorId"),
            order: a.integer(),
            type: a.string(),
            status: a.enum(["draft", "published"]),
            seo: a.ref("Seo"),
            comments: a.hasMany("Comment", "postId"),
            sections: a.hasMany("SectionPost", "postId"),
            tags: a.hasMany("PostTag", "postId"),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    Tag: a
        .model({
            id: a.id().required(),
            name: a.string().required(),
            posts: a.hasMany("PostTag", "tagId"),
        })
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    PostTag: a
        .model({
            postId: a.id().required(),
            tagId: a.id().required(),
            post: a.belongsTo("Post", "postId"),
            tag: a.belongsTo("Tag", "tagId"),
        })
        .identifier(["postId", "tagId"])
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),

    SectionPost: a
        .model({
            sectionId: a.id().required(),
            postId: a.id().required(),
            section: a.belongsTo("Section", "sectionId"),
            post: a.belongsTo("Post", "postId"),
        })
        .identifier(["sectionId", "postId"])
        .authorization((allow) => [
            allow.publicApiKey().to(["read"]),
            allow.authenticated().to(["read"]),
            allow.group("ADMINS").to(["create", "update", "delete", "read"]),
        ]),
});

export type Schema = ClientSchema<typeof schema>;

export const amplifyConfig = {
    data: {
        modelIntrospection: {
            enableLazyLoading: true,
        },
    },
};

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "userPool",
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});
