#!/bin/bash

# CE SCRIPT PERMET DE FUSIONNER TOUS LES FICHIERS MARKDOWN DANS UN SEUL FICHIER
# IL PERMET EGALEMENT DE COPIER LES IMAGES DANS LE DOSSIER DE SORTIE
# PUIS DE GENERER UN FICHIER PDF AVEC PANDOC-IESN (DOCKER)
# ATTENTION, IL S'EXECUTE DEPUIS LA RACINE DU PROJET: ./docs/merge.sh groupe_X
# VOUS DEVEZ AVOIR DOCKER INSTALLE SUR VOTRE MACHINE

outputDir=$(pwd)/docs/output

# if OS is Windows, add a / before the outputDir (the os can be 32 bits or 64 bits)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "win64" ]]; then
  outputDir="/$outputDir"
fi

if [ -z "$1" ]; then
  echo "No argument supplied. Usage: ./merge.sh [groupe_1|groupe_2|groupe_3]"
  exit 1
fi
groupName=$1

echo "Preparing output directory at $outputDir for $groupName..."
if [ ! -d "docs/output" ]; then
  mkdir docs/output
fi
if [ ! -d "docs/output/assets" ]; then
  mkdir docs/output/assets
fi
if [ -f docs/output/document.md ]; then
  rm docs/output/document.md
fi

echo "Merging markdown files..."
cp docs/$groupName/main.md docs/output/document.md
find docs -maxdepth 1 -name "*.md" -type f | sort | xargs cat >>docs/output/document.md
cat docs/$groupName/5_conclusion.md >>docs/output/document.md

echo "Copying images to output directory..."
cp -r docs/assets docs/output

echo "Generating PDF..."
docker run --rm -v $outputDir:/data mfreeze/pandoc-iesn:mermaid-latest -p xelatex -m -l -M -e -N -I -i pdf document.md
