# CardTracker

## What This Is

CardTracker is a local-first web app that helps people quickly choose the best credit card from their wallet for a purchase category. Users can maintain their wallet of cards and see a ranked recommendation list by category. The next milestone adds a built-in catalog of popular cards with predefined rewards, alongside custom manual cards.

## Core Value

A user can choose a purchase category and immediately see the best card in their wallet, ranked correctly by multiplier.

## Requirements

### Validated

- ✓ Users can manually add cards with category multipliers — existing
- ✓ Users can edit and delete manually added cards — existing
- ✓ Users can select a category and see wallet cards ranked by best multiplier — existing
- ✓ Data persists locally in browser storage without login — existing

### Active

- [ ] Users can add cards from a built-in catalog of popular cards with predefined rewards
- [ ] Catalog cards are non-editable once added to wallet
- [ ] Users can still manually add custom cards and edit custom cards
- [ ] Users can delete catalog cards from wallet
- [ ] The same catalog card can only be added once to wallet
- [ ] Users can search/filter catalog cards by name and issuer

### Out of Scope

- External card-data API integration — fixed curated list is sufficient for v1
- Advanced metadata (annual fee, network, perks) — not needed for initial user flow
- Multi-device sync/cloud accounts — current product remains local-first

## Context

- Existing codebase is a vanilla JS PWA (`index.html`, `app.js`, `styles.css`, `sw.js`) with IndexedDB persistence.
- Current app already provides category comparison and wallet management for manually entered cards.
- Product direction is now general-user focused rather than personal-only, so discoverability and guardrails matter.
- The new card-add flow needs two clear paths: catalog selection and custom entry, while preserving current ranking behavior.

## Constraints

- **Tech stack**: Keep current browser-only vanilla JS architecture — minimize rewrite risk for this milestone.
- **Data source**: Catalog must be static and bundled in-app — no backend/API dependency for v1.
- **Data integrity**: Catalog card definitions are canonical and immutable in wallet — prevent accidental editing drift.
- **Usability**: General users must be able to find a card quickly — include search/filter by name and issuer.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use fixed built-in catalog for v1 | Keeps implementation simple and reliable without external dependencies | — Pending |
| Keep manual custom card flow | Users need support for cards not in curated list | — Pending |
| Catalog cards are read-only in wallet | Preserves predefined reward accuracy | — Pending |
| Enforce one instance per catalog card | Prevents duplicate wallet entries and ranking noise | — Pending |
| Include catalog search/filter by name and issuer only | Improves discoverability without over-scoping metadata/filter complexity | — Pending |

---
*Last updated: 2026-02-28 after initialization*
