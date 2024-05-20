
## Analyse

### Objectif
Le client souhaite le développement d'un gestionnaire d'albums photo sécurisé de bout-en-bout.

### Définition des besoins

Les besoins suivants sont le résultat d'une analyse approfondie des demandes client et sont formulés sous forme d'_user stories_.

#### Besoins fonctionnels

- Un **utilisateur** doit pouvoir **s'enregistrer** dans le système.

- Un **utilisateur** doit pouvoir **se connecter** au système.

- Un **utilisateur** doit pouvoir **consulter son historique d'activités**.

- Un **utilisateur** peut **changer ses crédentiels** à n'importe quel moment.

- Un **utilisateur** peut **se connecter depuis différents appareils**.

- Un **utilisateur** peut **créer un album** avec un nom et des métadonnées (description et partage à d'autres utilisateurs).
NB: il en est considéré le propriétaire

- Un **utilisateur** peut **téléverser une image** avec un nom et des métadonnées (description et partage à d'autres utilisateurs).
NB: il en est considéré le propriétaire
NB2: les images peuvent être téléversées dans un album si l'utilisateur en est le propriétaire, ou en "standalone" (pas dans un album)

- Un **utilisateur** peut **voir les photos** dont il est **propriétaire**.

- Un **utilisateur** peut **supprimer les photos** dont il est **propriétaire**.

- Un **utilisateur** peut **partager des photos** de deux manières:
  - en partageant un album (toutes les photos sont partagées immédiatement aux utilisateurs qui y ont accès) ;
  - en partageant directement la photo (qu'elle soit ou non au sein d'un album).

- Un **utilisateur** peut **__voir__ les photos** qui lui ont été **partagées**.
NB: c'est une visibilité read-only, il n'a pas le droit de modifier ces photos.

#### Besoins techniques
Une architecture client/serveur est obligatoire, dans laquelle le serveur n'est pas une entité de confiance.

Les informations relatives aux utilisateurs, aux albums, aux photos et aux métadonnées de celles-ci sont considérés sensibles et doivent donc être chiffrés avant leur envoi vers le serveur.
