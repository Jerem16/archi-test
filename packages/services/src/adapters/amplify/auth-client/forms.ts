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
