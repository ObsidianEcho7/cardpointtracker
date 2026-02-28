# Phase 3: Catalog-to-Wallet Integration - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect catalog selection to wallet state so users can add catalog cards to their wallet, prevent duplicate adds, and remove previously added catalog cards.

</domain>

<decisions>
## Implementation Decisions

### Catalog add control behavior
- Show an inline add action on each catalog card row.
- Use `Add to Wallet` as the default action label for not-yet-added cards.
- After successful add, replace the action with a disabled `Added` state.
- Also show a brief inline success message near the added card.

### Claude's Discretion
- Exact timing and animation treatment for the brief inline success message.
- Exact ordering strategy for wallet list placement after add/remove, as long as ranking refreshes correctly.
- Precise copy for duplicate-prevention and remove-flow messaging (not discussed yet).

</decisions>

<specifics>
## Specific Ideas

- Keep add feedback local to the catalog row to preserve fast scan-and-add flow.
- Preserve one-tap behavior from catalog row without modal/detail detours.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---
*Phase: 03-catalog-to-wallet-integration*
*Context gathered: 2026-02-28*
