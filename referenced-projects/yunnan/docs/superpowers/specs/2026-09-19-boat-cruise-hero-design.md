# 2026-09-19 Three.js 船程首屏 + 唱机重生

## Goal
Replace the flat scrapbook hero with a **live Three.js auto-cruise** (option B, max quality): a soft isometric boat sails 西双版纳 → 景迈山 → 大理 → 丽江 → 香格里拉 on journal-matched teal water. Fix the about-section flatness and regenerate a readable suitcase turntable asset.

## Non-goals
- WASD sailing / free roam
- Pre-rendered MP4 as primary delivery
- Globe / earth fly-lines
- Changing chapter narrative structure

## Visual system
- Palette: `--mint #b7e2de`, deep water `#1a6b72`→`#0f4a52`, land `#7a9b5e`/`#ebc477` sand, ink `#174d43`, paper cream for UI only
- Style: soft low-poly / rounded indie (Atoll-like), **not** tropical coral pink — Yunnan lake + mountain silhouettes
- Motion: ~16s seamless loop; `prefers-reduced-motion` → static poster frame + no loop

## Architecture
1. `js/boat-cruise.js` — Three.js scene module, mounts into `#boat-cruise`, exports `initBoatCruise(el)` / `destroy`
2. Hero markup — full-bleed canvas under copy wash; remove competing print collage as primary visual
3. `css/boat-cruise.css` — layout, wash, reduced-motion poster
4. About — water-wash background; turntable uses new `assets/illustrations/record-player-journal.png`
5. CDN Three.js (ESM) via import map in `index.html`

## Quality bar (max)
- Soft fog, animated water shader, foam wake, gentle sun rim
- Distinct island landmarks per stop + floating Chinese labels
- DPR capped at 2; pause offscreen / hidden tab
- Boat easing along CatmullRom path with look-ahead heading

## Turntable
- New transparent PNG: open red travel suitcase player, teal lining, visible empty platter for vinyl overlay, moss accents matching journal
- Keep `vinyl-spin` wrapper; recalibrate `.mounted-record` % if art shifts

## Acceptance
- Hero shows live boat cruise without console errors
- Five stop labels visible in order
- About background not flat cream-only
- Dropping a disc shows spinning vinyl on the new player art
- Reduced-motion: no continuous GPU animation
