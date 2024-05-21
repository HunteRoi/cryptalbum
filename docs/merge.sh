#!/bin/bash

# CE SCRIPT PERMET DE FUSIONNER TOUS LES FICHIERS MARKDOWN DANS UN SEUL FICHIER
# IL PERMET EGALEMENT DE COPIER LES IMAGES DANS LE DOSSIER DE SORTIE
# PUIS DE GENERER UN FICHIER PDF AVEC PANDOC-IESN (DOCKER)
# ATTENTION, IL S'EXECUTE DEPUIS LA RACINE DU PROJET: ./docs/merge.sh
# VOUS DEVEZ AVOIR DOCKER INSTALLE SUR VOTRE MACHINE, ET EVIDEMMENT CHANGER LES CHEMINS
# VERS LES BONS FICHIERS (docs/groupe_X/main.md, docs/groupe_X/5_conclusion.md et le chemin absolu pour le volume Docker)

group_number=$1
if [ -z "$group_number" ]; then
  echo "Please provide a group number as an argument (1-3)"
  exit 1
fi

if [ ! -d "docs/output" ]; then
  mkdir docs/output
fi

if [ ! -d "docs/output/assets" ]; then
  mkdir docs/output/assets
fi

if [ -f docs/output/document.md ]; then
  rm docs/output/document.md
fi

# Find main markdown file and copy it to the output directory
cp docs/groupe_$group_number/main.md docs/output/document-$group_number.md

# Find and sort all markdown files in the current directory, then concatenate them into the same file
find docs -maxdepth 1 -name "*.md" -type f | sort | xargs cat >>docs/output/document-$group_number.md

# Find conclusion markdown file and copy to to the output directory into the same file
cat docs/groupe_$group_number/5_conclusion.md >>docs/output/document-$group_number.md

# Copy all images from the images directory to the output directory
cp -r docs/assets docs/output

docker run -v //c/Users/artsl/Documents/cryptalbum/docs/output:/data mfreeze/pandoc-iesn:mermaid-latest -p xelatex -m -l -M -e -N -I -i pdf document.md