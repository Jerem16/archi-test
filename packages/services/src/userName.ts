export type UserNameCreateInput = {
    id: string;
    userName: string;
};

export const userNameService = {
    async create(_data: UserNameCreateInput): Promise<void> {
        // Implémentation spécifique à l'application à fournir
    },
};
