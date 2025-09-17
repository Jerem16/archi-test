// src/entities/core/utils/amplifyUiConfig.ts
import { I18n } from "aws-amplify/utils";

export const configureI18n = () => {
    I18n.setLanguage("fr");
    I18n.putVocabularies({
        fr: {
            "Sign In": "Connexion",
            "Sign Up": "Inscription",
            "Sign in": "Se connecter",
            "Sign in to your account": "Connexion à votre compte",
            "Create Account": "Créer un compte",
            Email: "Adresse e-mail",
            Password: "Mot de passe",
            "Forgot your password?": "Mot de passe oublié ?",
            "Reset Password": "Réinitialiser le mot de passe",
            "Confirm Password": "Confirmer le mot de passe",
            "Phone Number": "Numéro de téléphone",
            "Family Name": "Nom",
            Name: "Prénom",
            Address: "Adresse",
            "Have an account?": "Vous avez déjà un compte ?",
            "Back to Sign In": "Retour à la connexion",
            Confirm: "Confirmer",
            Submit: "Soumettre",
            "Verification code": "Code de vérification",
            "Resend Code": "Renvoyer le code",
            "Sign Out": "Se déconnecter",

            "Enter your email": "Saisissez votre adresse e-mail",
            "Enter your password": "Saisissez votre mot de passe",
            "Enter your phone number": "Saisissez votre numéro de téléphone",
            "Enter your family name": "Saisissez votre nom",
            "Enter your given name": "Saisissez votre prénom",
            "Enter your address": "Saisissez votre adresse",
            "Confirm your password": "Confirmez votre mot de passe",
            "Enter your verification code": "Saisissez votre code de vérification",
        },
    });
};

export const formFieldsAll = {
    signIn: {
        username: {
            label: "Adresse e-mail :",
            placeholder: "Entrez votre adresse e-mail",
            isRequired: true,
            labelHidden: false,
        },
        password: {
            label: "Mot de passe :",
            placeholder: "Entrez votre mot de passe",
            isRequired: true,
            labelHidden: false,
        },
    },
    signUp: {
        family_name: {
            label: "Nom :",
            placeholder: "Entrez votre nom",
            isRequired: true,
            order: 2,
        },
        given_name: {
            label: "Prénom :",
            placeholder: "Entrez votre prénom",
            isRequired: true,
            order: 3,
        },
        email: {
            label: "Adresse e-mail :",
            placeholder: "Entrez votre adresse e-mail",
            isRequired: true,
            order: 1,
        },
        password: {
            label: "Mot de passe :",
            placeholder: "Créez un mot de passe",
            isRequired: true,
            order: 4,
        },
        confirm_password: {
            label: "Confirmer le mot de passe :",
            placeholder: "Confirmer le mot de passe",
            isRequired: true,
            order: 5,
        },
        address: {
            label: "Adresse :",
            placeholder: "Entrez votre adresse",
            isRequired: false,
            order: 6,
        },
        phone_number: {
            label: "Numéro de téléphone :",
            placeholder: "Entrez votre numéro de téléphone",
            isRequired: false,
            dialCode: "+33",
            order: 7,
        },
    },
};
export const formFields = {
    signIn: {
        username: {
            label: "Adresse e-mail :",
            placeholder: "Entrez votre adresse e-mail",
            isRequired: true,
            labelHidden: false,
        },
        password: {
            label: "Mot de passe :",
            placeholder: "Entrez votre mot de passe",
            isRequired: true,
            labelHidden: false,
        },
    },
    signUp: {
        email: {
            label: "Adresse e-mail :",
            placeholder: "Entrez votre adresse e-mail",
            isRequired: true,
            order: 1,
        },
        password: {
            label: "Mot de passe :",
            placeholder: "Créez un mot de passe",
            isRequired: true,
            order: 2,
        },
        confirm_password: {
            label: "Confirmer le mot de passe :",
            placeholder: "Confirmez le mot de passe",
            isRequired: true,
            order: 3,
        },
    },
};
