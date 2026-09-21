# Correction portrait — 21 septembre 2026

## Construction
Les crops V16 sont supprimés de l’expérience mobile. Un seul fond portrait cohérent par page, généré avec l’outil intégré image_gen à partir du décor de référence, puis optimisé WebP (941×1672, sans prétention 4K).
- Studio : `atelier/studio-portrait.webp`, original PNG voisin. Sept objets dans un SVG 941×1672, vrais calques repositionnés à échelle uniforme avec leurs effets et liens ; TV du nouveau décor avec effet CRT. Objets originaux isolés dans `atelier/*-portrait-object.webp` sans modification de leurs pixels, uniquement retrait des marges transparentes.
- Affiches : `affiches/assets/studio-portrait.webp`, original PNG voisin. Trois vraies affiches encadrées au mur + Zoologie sur le chevalet, liens individuels. Aucun poster redessiné dans l’image générée.
- Références : `atelier/decor-clean-2048.webp`, `affiches/assets/atelier.webp`.

## Prompt final — Studio
Créer une seule photographie de studio complète en portrait 9:16, réellement recomposée et non recadrée depuis l’image horizontale. Même univers mid-century années 1970, noyer, terracotta, canapé rouille, fenêtre ronde, plantes, lampes champignon et soleil couchant orange. Bibliothèque à gauche avec globe et étagère vide ; mur calme en haut à droite pour affiche ; téléviseur CRT au milieu à droite ; table d’appoint vide à gauche ; canapé avec assise libre ; large table basse ovale vide au premier plan. Une pièce continue, perspectives cohérentes, aucune mosaïque ni interface. Aucun porte-clé, canette, appareil photo, carte ou logo généré : les originaux sont superposés ensuite.

## Prompt final — Affiches
Créer une seule photographie de studio de création complète en portrait 9:16 à partir du style de la référence horizontale, sans crop ni collage. Mur sombre texturé, lumière chaude par fenêtre industrielle à gauche, noyer usé, plantes, étagères, lampes, rouleaux et pinceaux, tapis. Trois emplacements libres sur mur : deux en haut et un au milieu gauche ; chevalet complet au milieu/bas droit avec support sombre presque frontal ; bureau en bas sans masquer le chevalet. Aucun texte, aucune œuvre générée ; les affiches originales sont placées séparément en code.

## Textes et scope
Wording de tristanraoult.com réutilisé, M1 et recherche d’alternance confirmés par l’utilisateur. Intro mobile dans un bloc séparé avant Focus pour éviter les chevauchements. Aucune consigne de pan horizontal mobile. Vocabulaire « studio » dans les HTML de navigation ; routes/identifiants existants conservés. Profil et contact inchangés. Galerie secondaire conservée.
Backup préalable : `work/v16-portrait-backup/`. V15 et backup intégral précédent intacts. Local seulement, serveur 8778.
