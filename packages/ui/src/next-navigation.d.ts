declare module "next/navigation" {
    export type AppRouterInstance = {
        push: (url: string) => void;
        replace: (url: string) => void;
    };
    export function useRouter(): AppRouterInstance;
}
