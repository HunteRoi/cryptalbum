
# Conclusion

## Statut actuel

Tel que demandé dans le cahier des charges, l'application est capable de gérer des utilisateurs, des albums et des
images, et ce, de manière sécurisée (via cryptographie asymétrique principalement). Toutes les demandes émises ont
été remplies et l'application est fonctionnelle et prête à être utilisée.

L'aspect cryptographique mis en avant dans le cahier des charges est respecté, et le client web est seul maître de la
cryptographie de ses données. En ce sens, l'application est sécurisée et respecte la confidentialité des données, tel
que prévu par le chiffrement de bout en bout. De plus, les données transitent via TLS grâce à l'utilisation du
reverse-proxy que nous avons mis en place avec le script `setup.sh`.

L'apport des différentes technologies de logging et de monitoring permettent de suivre l'activité de l'application et
d'éviter la compromission des données, ce qui est un plus pour la sécurité de l'application.

## Critiques et Améliorations

L'application est fonctionnelle, mais quelques améliorations pourraient être apportées. En effet, l'application possède
un 4,2% de ses lignes de codes dupliquées (environ 320 lignes sur les 7600 du projet), entre autres au niveau du
chiffrement des données avant envoi, ce qui n'est pas optimal pour une application en production. Il serait intéressant
de refactoriser le code pour éviter la duplication de code et rendre le tout plus maintenable.

Les résultats de SonarCloud et Snyk aux [@fig:resultats-sonarcloud; @fig:resultats-snyk] montrent effectivement que le
code n'est pas parfait, mais reste néanmoins tout à fait acceptable pour une application de cette envergure, surtout
dans un cadre académique.

![Résultats SonarCloud](./assets/sonarcloud-results.png){#fig:resultats-sonarcloud}

![Résultats Snyk](./assets/security-reliability-maintainability.png){#fig:resultats-snyk}

En termes d'améliorations, nous pourrions penser à un système de notifications. Il serait intéressant d'en ajouter pour
informer les utilisateurs des actions effectuées sur l'application, comme la réception d'un album partagé par exemple.

Mis à part ces améliorations, peu de critiques négatives pourraient être émises vis-à-vis de l'application. Le travail
réalisé est de qualité et l'application est fonctionnelle, sécurisée et prête à être utilisée.
