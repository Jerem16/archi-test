declare module "@apps/amplify_outputs.json" {
    interface AmplifyAuthConfig {
        [key: string]: unknown;
    }

    interface AmplifyDataConfig {
        [key: string]: unknown;
    }

    interface AmplifyStorageConfig {
        [key: string]: unknown;
    }

    interface AmplifyOutputs {
        auth: AmplifyAuthConfig;
        data: AmplifyDataConfig;
        storage?: AmplifyStorageConfig;
        version: string;
        [key: string]: unknown;
    }

    const outputs: AmplifyOutputs;
    export default outputs;
}
