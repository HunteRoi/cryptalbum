# Analyse

## Objectif

Le client souhaite le développement d'un gestionnaire d'albums photo sécurisé de bout-en-bout.

## Définition des besoins

Les besoins suivants sont le résultat d'une analyse approfondie des demandes client et sont formulés sous forme d'_user
stories_.

### Besoins fonctionnels

- Un **utilisateur** doit pouvoir **se connecter** au système.
- Un **utilisateur** doit pouvoir **créer un compte** **avec une paire de clés** cryptographiques.
- Un **utilisateur** doit pouvoir **se connecter à son compte** depuis l'appareil avec lequel il a créé son compte.
- Un **utilisateur** doit pouvoir **se connecter à son compte** **avec un appareil différent** de celui utilisé à la
  création du compte.
- Un **utilisateur** doit pouvoir **regénérer une paire de clés** cryptographiques pour un appareil.
- Un **utilisateur** doit pouvoir **supprimer un appareil** de son compte.
- Un **utilisateur** doit pouvoir **supprimer son compte**.
- Un **utilisateur** doit pouvoir **gérer ses photos**.
- Un **utilisateur** doit pouvoir **uploader une photo**.
- Un **utilisateur** doit pouvoir **modifier une photo**.
- Un **utilisateur** doit pouvoir **supprimer une photo**.
- Un **utilisateur** doit pouvoir **partager une photo**.
- Un **utilisateur** doit pouvoir **déplacer une photo** dans un album.
- Un **utilisateur** doit pouvoir **gérer ses albums** photo.
- Un **utilisateur** doit pouvoir **créer un album** photo.
- Un **utilisateur** doit pouvoir **partager un album** photo.
- Un **utilisateur** doit pouvoir **modifier un album** photo.
- Un **utilisateur** doit pouvoir **ajouter des photos à un album**.
- Un **utilisateur** doit pouvoir **supprimer un album**.
- Un **utilisateur** doit pouvoir **retirer une photo d'un album**.
- Un **utilisateur** doit pouvoir **voir les albums photo** qu'il a créés.
- Un **utilisateur** doit pouvoir **voir les photos** qu'il a ajoutées.
- Le **système** doit **limiter les requêtes** par utilisateur.
- Le **système** doit **signer les logs** pour **prouver leur intégrité**.
- Un **utilisateur** doit pouvoir **voir son historique**.
- **Toute activité est historisée** (log).
  - Les activités sont loggées **dans une table en base de données**.
  - Les activités sont loggées **dans un serveur Seq**.
  - La **création d'un compte** utilisateur doit être loggée.
  - La **suppression d'un compte utilisateur** doit être loggée.
  - La **connexion** d'un utilisateur doit être loggée.
  - L'**ajout d'un nouvel appareil** pour un utilisateur doit être loggé.
  - La **suppression d'un appareil utilisateur** doit être loggée.
  - La **modification de la paire de clés** cryptographiques d'un appareil doit être loggée.
  - La **création d'un album** doit être loggée.
  - Le **partage d'un album** doit être loggé.
  - La **modification d'un album** doit être loggée.
  - La **suppression d'un album** doit être loggée.
  - L'**ajout d'une photo** doit être loggé.
  - La **modification d'une photo** doit être loggée.
  - La **suppression d'une photo** doit être loggée.
  - Le **partage d'une photo** doit être loggé.
  - L'**ajout d'une photo dans un album** doit être loggé.
  - Le **retrait d'une photo d'un album** doit être loggé.

### Besoins techniques

Une architecture client/serveur est obligatoire, dans laquelle le serveur n'est pas une entité de confiance.

Les informations relatives aux utilisateurs, aux albums, aux photos et aux métadonnées de celles-ci sont considérées
sensibles et doivent donc être chiffrées avant leur envoi vers le serveur.
