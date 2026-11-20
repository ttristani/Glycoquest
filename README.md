# GlycoQuest 🦉

Application gratuite et ludique de suivi du diabète de type 2 sous traitement GLP-1.
C'est une web app installable (PWA) : elle s'ajoute à l'écran d'accueil de l'iPhone, s'ouvre en plein écran et fonctionne hors ligne. Elle n'utilise ni serveur, ni compte, ni abonnement.

## Fonctions

| Onglet | Ce qu'on y fait |
|---|---|
| 🏠 Accueil | Message de la mascotte, niveau et XP, série de jours 🔥, dernière glycémie, prochaine injection, 3 défis du jour, compteur d'eau, conseil du jour, quiz du jour |
| 🩸 Glycémie | Saisie avec un grand pavé numérique (g/L ou mg/dL), moment de la mesure, courbe sur 7/14/30 jours avec la cible, statistiques, alertes hypo (règle des 15) et glycémie très haute |
| 🍽️ Repas | Composition de l'assiette parmi ~80 aliments, note sur 100, glucides estimés, anneau de l'assiette idéale, conseils. Une mesure faite 2 h après un repas est reliée à ce repas, ce qui permet de repérer les « aliments à surveiller » |
| 💉 Traitement | Compte à rebours de l'injection GLP-1 (hebdomadaire ou quotidienne), carte du corps avec rotation des zones conseillée, effets secondaires, poids, rappel dans le calendrier (.ics) |
| 🏆 Trophées | Niveaux, 18 badges, barème des XP, **rapport sur 30 jours pour le médecin** (imprimable en PDF ou partageable), réglages, sauvegarde et restauration |

## Mise en ligne gratuite (GitHub Pages, environ 10 minutes)

1. Crée un compte gratuit sur https://github.com, puis un dépôt **public** nommé `glycoquest`.
2. Envoie tous les fichiers du dossier dans le dépôt. Tu peux les glisser-déposer sur la page du dépôt (« Add file ➜ Upload files »), ou passer par VS Code et git :
   ```bash
   cd glycoquest
   git init && git add . && git commit -m "GlycoQuest"
   git branch -M main
   git remote add origin https://github.com/TON-PSEUDO/glycoquest.git
   git push -u origin main
   ```
3. Dans le dépôt, va dans **Settings ➜ Pages ➜ Source : Deploy from a branch ➜ main / (root) ➜ Save**.
4. Après une minute, l'app est en ligne sur `https://TON-PSEUDO.github.io/glycoquest/`.

## Installation sur l'iPhone de ton père

1. Ouvre l'adresse dans **Safari** (pas Chrome).
2. Touche le bouton **Partager** ⬆️, puis **Sur l'écran d'accueil**.
3. L'icône GlycoQuest apparaît. Lance l'app depuis cette icône, pas depuis Safari : les données sont liées à l'icône.

## Tester et modifier dans VS Code

- Installe l'extension **Live Server**, fais un clic droit sur `index.html` puis **Open with Live Server**.
- Pour tester sur l'iPhone pendant le développement, il faut que l'app soit en ligne (étapes ci-dessus).

Fichiers :
- `data.js` contient les aliments, les conseils, le quiz et les défis. C'est le fichier à enrichir en priorité (les plats préférés de ton père, par exemple).
- `app.js` contient toute la logique : notes des repas, XP, badges, écrans.
- `style.css` contient les couleurs et les tailles. Les variables sont en haut du fichier.
- `sw.js` gère le mode hors ligne. **Augmente `CACHE = "glycoquest-v1"` (v2, v3…) à chaque mise à jour**, sinon l'iPhone peut garder l'ancienne version.

Après un `git push`, la mise à jour arrive sur l'iPhone à la prochaine ouverture de l'app (parfois à la deuxième).

## Données et sauvegarde

- Tout est stocké **uniquement sur l'iPhone** (localStorage) et rien n'est envoyé sur Internet.
- Si l'app est supprimée de l'écran d'accueil, les données sont perdues. Pense à faire **Trophées ➜ Réglages ➜ Exporter** de temps en temps (vers Fichiers ou par e-mail). **Importer** restaure la sauvegarde.

## Limites connues

- Une web app iOS ne peut pas envoyer de notification programmée sans serveur. Le rappel d'injection passe donc par le calendrier ou l'app Rappels.
- Les glucides sont des estimations par portion type : c'est un outil d'éducation, pas un calcul précis.
- Les cibles par défaut (0,80–1,30 g/L à jeun, < 1,80 g/L 2 h après un repas) sont les valeurs habituelles. Elles **doivent être validées par le médecin** et se règlent dans Réglages.

⚠️ GlycoQuest aide au suivi mais ne remplace pas un avis médical.
