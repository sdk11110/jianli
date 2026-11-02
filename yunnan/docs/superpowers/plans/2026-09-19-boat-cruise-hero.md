# Three.js Boat Cruise Hero Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Ship max-quality live Three.js auto-cruise hero + regenerated turntable + richer about backdrop.

**Architecture:** ESM Three.js scene module mounts under hero; journal copy overlays with left wash; turntable asset swap + CSS recalibration.

**Tech Stack:** Three.js r170+ ESM CDN, vanilla JS, existing journal CSS tokens.

## Global Constraints
- Static site only; no bundler required
- Match journal palette; no purple/glow AI defaults
- Preserve existing chapter content and photo flows
- Reduced-motion must disable cruise loop

---

### Task 1: Spec assets + turntable image
- [ ] Generate `record-player-journal.png` (transparent, suitcase turntable)
- [ ] Copy into `assets/illustrations/`
- [ ] Point `turntable.js` at new asset; tune `.mounted-record` if needed

### Task 2: Boat cruise module
- [ ] Add `js/boat-cruise.js` with water shader, 5 islands, boat+wake, labels, 16s loop
- [ ] Add `css/boat-cruise.css`
- [ ] Import map + script in `index.html`

### Task 3: Hero / about integration
- [ ] Rewrite hero shell in `journal.js` for `#boat-cruise` full-bleed
- [ ] Soften about background (mint water wash)
- [ ] Init cruise after DOM paint; destroy on teardown not required for SPA-less page

### Task 4: Verify
- [ ] Manual: spin vinyl, watch boat pass all five labels
- [ ] Check reduced-motion path
