# pce-utils

Scripts pour la manipulation des fichiers PCE.

## Conversion d'un export Siwidata
Pour convertir un export Siwidata (format CSV) en fichier PCE, avec reconstruction des id bateau à partir de la base slalom FFCK.
* Editer le fichier siwidataParser.js (lignes 7 à 10) selon les fichiers à traiter
* npm install
* npm run getBoats
* node siwidataParser.js > export.pce

## Correction des critères de Finale A/B
Pour attribuer les critères A/B manquants sur un fichier de finale, à partir de la qualif.
* Editer le fichier fixCriteria.js
* npm install
* node fixCriteria.js

