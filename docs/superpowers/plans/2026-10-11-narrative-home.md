# Narrative Home Implementation Plan

> **For agentic workers:** Execute task by task and verify after the visual pass. Spec: `docs/superpowers/specs/2026-10-11-narrative-home-design.md`.

**Goal:** Upgrade the `home/` narrative page into a continuous, video-like portfolio scene using the supplied character board and existing transparent poses.

**Architecture:** Keep the static HTML/CSS/JS + Three.js CDN stack. Preserve `HomeContent` and portal behavior while upgrading stage composition, motion timing, character board texture, and responsive layout.

**Tech Stack:** HTML, CSS custom properties, vanilla JavaScript, Three.js CDN, existing PNG assets.

## Global Constraints

- Preserve factual copy, email, external links, and existing subsite destinations.
- Use the supplied character board images in the `assets/character/` folder.
- Keep all page content available with reduced motion enabled.
- Avoid new runtime dependencies.

### Task 1: Supplied character art and visual contract

- Copy the two supplied character boards to `assets/character/reference-board.png` and `assets/character/reference-sheet.png`.
- Add the direction contract comment to `index.html` so the palette, reading order, and motion thesis are auditable.

### Task 2: Continuous stage composition

- `index.html`: add a board texture layer, chapter marker, and pointer halo while preserving semantic content.
- `css/home.css`: rebuild tokens, responsive stage layout, paper/deep-night/lake scenes, card depth, and smooth transitions.
- `js/stage.js`: keep beat mapping but coalesce scroll updates, add texture crossfade and per-beat progress variables.

### Task 3: Atmosphere and interaction polish

- `js/atmosphere.js`: tune pointer parallax and tone transitions for the new scene tokens.
- Add pointer halo and chapter marker behavior without hiding primary content.

### Task 4: Verification

- Run syntax checks for `stage.js`, `content.js`, and `atmosphere.js`.
- Run the local server and inspect desktop and mobile screenshots at the first, middle, and final beats.
- Run the Impeccable mechanical detector once over `index.html`, `css/home.css`, and `js/*.js`.

