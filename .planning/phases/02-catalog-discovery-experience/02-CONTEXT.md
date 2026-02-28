# Phase 2: Catalog Discovery Experience - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Introduce a built-in, read-only catalog that users can browse and discover by card name and issuer. This phase covers discovery UX only (view/search/filter). Wallet add/remove integration is deferred to later phases.

</domain>

<decisions>
## Implementation Decisions

### Catalog source and scope
- Use a fixed in-app list of popular credit cards with predefined multipliers.
- Keep card fields minimal for now: `name`, `issuer`, and category multipliers.
- Exclude extra metadata (annual fee, network, perks) in v1.

### Discovery behavior
- Provide search by card name with case-insensitive substring matching.
- Provide issuer filter and allow combining filter + search.
- Keep catalog entries read-only in this phase.

### Presentation and UX
- Add a dedicated catalog section to the main screen.
- Show clear empty-state messaging when no catalog results match filters.
- Keep discovery UI lightweight and fast on desktop/mobile.

### Claude's Discretion
- Final curated card count for initial static catalog.
- Exact list visual styling and content density.
- Internal helper/function organization for catalog normalization and filtering.

</decisions>

<specifics>
## Specific Ideas

- Fixed list is preferred over external APIs for initial release.
- "Everything Else" remains the fallback category in reward structures.
- Catalog should feel easy to scan before wallet integration lands.

</specifics>

<deferred>
## Deferred Ideas

- Add catalog cards into wallet state (Phase 3).
- Prevent duplicate catalog cards in wallet (Phase 3).
- Enforce non-editable catalog cards after add (Phase 4).

</deferred>

---
*Phase: 02-catalog-discovery-experience*
*Context gathered: 2026-02-28*
