# Utilitaires d'interface Amplify

## `amplifyUiConfig`

Ce module centralise la configuration de l'interface d'authentification d'AWS Amplify.

- `configureI18n` définit la langue en français et injecte les traductions via `I18n.setLanguage` et `I18n.putVocabularies`.
- `formFields` personnalise les champs des formulaires `signIn` et `signUp` (labels, placeholders, ordre...).

## `createModelForm`

`createModelForm` génère un objet `{ zodSchema, initialForm, toForm, toCreate, toUpdate }`
permettant de centraliser la transformation des modèles, la validation et la
conversion vers les formats de création ou de mise à jour.

### Exemple

```ts
import { z } from "zod";

interface Utilisateur {
    id: string;
    email: string;
    prenom: string;
    nom: string;
}

interface FormulaireUtilisateur {
    email: string;
    nomComplet: string;
}

const utilisateurForm = createModelForm<
    Utilisateur,
    FormulaireUtilisateur,
    FormulaireUtilisateur,
    FormulaireUtilisateur
>({
    zodSchema: z.object({
        email: z.string(),
        nomComplet: z.string(),
    }),
    initialForm: { email: "", nomComplet: "" },
    toForm: (user) => ({
        email: user.email,
        nomComplet: `${user.prenom} ${user.nom}`,
    }),
    toCreate: (form) => form,
    toUpdate: (form) => form,
});

const exemple: Utilisateur = {
    id: "42",
    email: "foo@bar.com",
    prenom: "Foo",
    nom: "Bar",
};

const valeursFormulaire = utilisateurForm.toForm(exemple);
// { email: "foo@bar.com", nomComplet: "Foo Bar" }
```
