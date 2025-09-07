export type UserNameCreateInput = {
    id: string;
    userName: string;
};

export const userNameService = {
    create(_data: UserNameCreateInput): Promise<void> {
        void _data;
        // Implémentation spécifique à l'application à fournir
        return Promise.resolve();
    },
};
