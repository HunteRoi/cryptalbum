
## Conclusion

### Statut actuel
Toutes les demandes principales ont été remplies : un utilisateur peut créer un compte, se connecter avec différents appareils, créer/supprimer/modifier des albums comme des images et partager ces albums et images.

L'historisation des activités est également présente sur les actions utilisateur.

### Critiques et Améliorations
En considérant le travail réalisé et la méthode d'exécution, et au vu de l'éventail de compétences de l'équipe, il ressort plusieurs points d'amélioration.

Premièrement, pour une application développée en quelques semaines, certains concepts très importants du développement ne sont pas respectés (éviter la duplication de code, éviter le couplage et simplifier la logique pour garantir la lisibilité et la maintenabilité, etc.).
Ces points sont d'ailleurs soulevés par SonarCloud et Snyk.

![Résultats SonarCloud](./assets/sonarcloud-results.png)

![Résultats Snyk](./assets/snyk-results.png)

CodeScene, quant à lui, nous affiche de bons résultats quant à la santé du code source, malgré ces résultats moins performants du côté de SonarCloud.

![Résultats CodeScene](./assets/codescene-results.png)

À part l'application de plusieurs principes clé du développement pour améliorer la lisiblité et la maintenabilité ainsi que certains concepts pour parfaire l'expérience utilisateur (e.g. fermer les popups une fois soumises, fusionner la connexion et l'envoi d'une requête de liaison d'un nouveau device, etc.), il est difficile de formuler des critiques négatives.
