# pce-utils

Script pour convertir un export Siwidata (format CSV) en fichier PCE, avec reconstruction des id bateau à partir de la base slalom FFCK.

## Utilisation
* Editer le fichier siwidataParser.js (lignes 7 à 10) selon les fichiers à traiter
* npm install
* npm run getBoats
* node siwidataParser.js > export.pce

