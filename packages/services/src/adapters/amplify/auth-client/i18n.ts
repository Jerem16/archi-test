// packages/ui/src/auth/aws-authenticator/i18n.ts
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
