# Board Doctor

Application web (PWA) de diagnostic de cartes électroniques pour l'atelier Thor Technologie.
Le technicien saisit l'appareil, le symptôme, ses mesures (mode diode, tensions, consommation)
et peut joindre une photo de la carte. L'IA (Claude, d'Anthropic) renvoie un rapport :
constats visibles, causes probables classées, démarche de mesure conseillée, points à vérifier
sur schéma ou boardview, et consignes de sécurité.

## Architecture

| Élément | Rôle |
| --- | --- |
| `src/` | Application React (Vite + Tailwind), installable sur téléphone |
| `netlify/functions/diagnose.mts` | Fonction serveur `POST /api/diagnose` qui appelle l'API Claude |
| `shared/diagnosis.ts` | Contrat partagé : format de la demande et du rapport |

La clé API reste **côté serveur** (variable d'environnement Netlify). Elle n'est jamais envoyée
au navigateur. Les photos sont réduites à 1568 px en JPEG avant l'envoi, ce qui allège l'envoi
et réduit le coût. L'historique est conservé dans le navigateur de chaque appareil
(50 diagnostics au maximum).

## Mise en ligne sur Netlify

1. **Créer une clé API** sur <https://console.anthropic.com> (Settings › API Keys) et approvisionner le compte.
2. Dans Netlify : **Site configuration › Environment variables**, ajouter :

   | Variable | Obligatoire | Rôle |
   | --- | --- | --- |
   | `ANTHROPIC_API_KEY` | oui | Clé API Anthropic |
   | `BOARD_DOCTOR_ACCESS_CODE` | recommandé | Code d'accès atelier. Sans lui, n'importe qui connaissant l'adresse peut consommer vos crédits. |
   | `BOARD_DOCTOR_MODEL` | non | Modèle Claude (défaut : `claude-opus-5-5`) |
   | `BOARD_DOCTOR_EFFORT` | non | `low` (défaut), `medium`, `high`. Plus élevé = raisonnement plus poussé mais plus lent. |

3. **Déployer avec la fonction serveur.** Un glisser-déposer du dossier `dist` ne déploie
   pas les fonctions. Utiliser l'une des deux méthodes suivantes :
   - relier le dépôt GitHub au site Netlify : `netlify.toml` fournit la commande de build ;
   - ou, depuis le Mac : `npx netlify-cli deploy --build --prod`.

> **Durée d'analyse.** Netlify interrompt une fonction au bout de 30 secondes. Avec l'effort
> `low`, une analyse prend en général de 10 à 20 secondes. Si vous passez à `medium` ou `high`,
> surveillez les erreurs « L'analyse a pris trop de temps ».

## Développement local

```bash
npm install
npx netlify-cli dev      # application + fonction /api/diagnose, avec ANTHROPIC_API_KEY dans .env
npm run build            # vérification TypeScript + build de production
```

`npm run dev` lance seulement l'interface : les appels à `/api/diagnose` échouent alors,
puisque la fonction ne tourne pas.

## Limites

- L'IA assiste le technicien et ne le remplace pas : chaque conclusion doit être confirmée
  par la mesure et le schéma. Le rapport le rappelle.
- Les photos HEIC (iPhone) ne sont pas lues par tous les navigateurs. Réglez l'appareil photo
  sur « Le plus compatible » (JPEG).
