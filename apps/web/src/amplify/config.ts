import type { ResourcesConfig } from "aws-amplify";

// ⚠️ Remplace les valeurs par les tiennes (UserPool, App Client, etc.)
const amplifyConfig: ResourcesConfig = {
    // auth: {
    //     Cognito: {
    //         userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID || "YOUR_APP_CLIENT_ID",
    //         userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "YOUR_USER_POOL_ID",
    //         loginWith: {
    //             email: true,
    //             username: false,
    //             phone: false,
    //         },
    //         allowGuestAccess: true,
    //     },
    // },
    // Ajoute Data, Storage, etc. si nécessaire
};

export default amplifyConfig;
