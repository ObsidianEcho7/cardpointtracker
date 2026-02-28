# Phase 1: Baseline Comparison Hardening - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the existing comparison experience so ranking behavior and top-card feedback are deterministic, user-clear, and stable while upcoming catalog work is introduced. This phase clarifies ranking/callout/edge-state behavior within current compare functionality, without adding new product capabilities.

</domain>

<decisions>
## Implementation Decisions

### Ranking Rules
- Tie-breakers use alphabetical card name ordering.
- Ranking must be deterministic for the same wallet + selected category.
- Ranked rows should show multiplier plus source label (`category match` or `other fallback`).
- Multiplier formatting trims unnecessary trailing zeros (for example `2x`, `1.5x`).

### Category Fallbacks
- If selected category is missing and `other` exists, use `other` multiplier.
- If neither selected category nor `other` exists, exclude that card from ranking for that category.
- Fallback ties use the same alphabetical tie-break rule.

### Top Card Callout
- Use a medium inline highlight above the ranking (not hero-sized).
- Callout displays card name + multiplier only.
- If no qualifying cards exist for selected category, show explicit message: "No qualifying cards for this category".
- Callout updates immediately on category change.

### Edge States
- Empty wallet state includes clear CTA to add cards.
- Single-card wallet still shows ranking list with one item plus callout.
- When category has zero qualifying cards, show empty ranking state with guidance text.
- Empty/error messaging should use moderate detail (one-line reason plus short hint).

### Claude's Discretion
- Exact copy phrasing for source labels and guidance hints, as long as behavior above remains unchanged.
- Visual styling details for inline callout and empty-state treatment.

</decisions>

<specifics>
## Specific Ideas

- Keep ranking behavior transparent and stable before catalog integration lands.
- Prioritize predictable ordering and clear feedback over adding more features in this phase.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-baseline-comparison-hardening*
*Context gathered: 2026-02-28*
