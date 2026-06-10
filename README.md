# Pixel Espresso ☕

Un mini-jeu **pixel art** où l'on prépare un espresso sur une machine
avec moulin intégré, étape par étape.

Ouvre `index.html` dans un navigateur (mobile ou desktop).

## Étapes du jeu

1. **Moudre** — règle la finesse de la mouture sur le moulin, puis
   maintiens le bouton pour moudre. La mouture tombe dans le porte-filtre ;
   vise la bonne dose (≈ 18 g, zone verte de la jauge).
2. **Tasser** — tasse la mouture *bien droite* (bulle au centre) avec la
   *bonne pression* (zone verte de la jauge).
3. **Placer** — glisse le porte-filtre pour le verrouiller sous le groupe,
   la tasse se met en place.
4. **Extraire** — règle la **température** (≈ 93 °C) et la **pression**
   (≈ 9 bar), puis lance l'extraction. Le café coule dans la tasse.
5. **Note** — l'espresso reçoit une note d'**équilibre** (A→E) avec un
   retour de dégustation (acide / amer / équilibré…).

Tout est dessiné au pixel sur un `<canvas>` 192×256 mis à l'échelle, sans
dépendance externe.

## Fichiers

- `index.html`, `game.css`, `game.js` — le jeu Pixel Espresso.
- `soundesizer.html`, `style.css`, `app.js` — l'ancien jouet sonore
  *soundesizer* (conservé).
