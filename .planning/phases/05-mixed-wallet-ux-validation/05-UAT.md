---
status: diagnosed
phase: 05-mixed-wallet-ux-validation
source:
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
started: 2026-03-06T16:43:34Z
updated: 2026-03-06T18:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running instance, clear local storage if needed, start the app fresh. It boots without errors and the main comparison panel renders.
result: pass
reported: "Re-ran with boot/render-only scope on a fresh start; the app rendered the comparison panel without errors before any catalog interaction."

### 2. Compare-First Panel Order
expected: The main screen panels are ordered as: Find Best Card, Your Cards, Add Card, then Popular Card Catalog.
result: pass

### 3. Catalog Collapsed by Default
expected: On first load, the catalog panel is hidden and the toggle reads "Show Catalog". Clicking it reveals the search and issuer filter controls.
result: pass
reported: "On a 390x844 viewport, tapping Show Catalog immediately revealed the search and issuer controls without additional manual scrolling."

### 4. Catalog Filter State Persists
expected: After opening the catalog, set a search term and issuer filter. Collapse the catalog and reopen it; the search term and issuer selection remain unchanged.
result: pass

### 5. Top-Four Ranking with Expand/Collapse
expected: With 5+ qualifying cards for a category, only the top four appear initially with a "View all" control. Clicking expands to show all; clicking "Show fewer" returns to four.
result: pass

### 6. Mixed-Wallet Ranking Stability
expected: Add a catalog card and a custom card with equivalent rewards for the selected category, plus at least one other card. The ranking order is deterministic and does not change after refresh or based on add order.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "App boots without errors and the main comparison panel renders after a fresh start."
  status: closed
  reason: "Cold-start smoke scope was re-run separately from catalog behavior and now passes with boot/render-only evidence."
  severity: resolved
  test: 1
  root_cause: "Gap was misclassified during UAT: the mobile catalog symptom was logged against the cold-start smoke test, which verifies boot/render only."
  artifacts:
    - path: ".planning/phases/05-mixed-wallet-ux-validation/05-UAT.md"
      issue: "Cold-start evidence now records a boot/render-only rerun instead of duplicating the mobile catalog symptom."
  missing:
    - "[done] Re-ran Test 1 with cold-start-only acceptance criteria and recorded the pass independently from catalog behavior."
    - "[done] Removed catalog-specific symptom text from the smoke-test scope."
  verification:
    - "2026-03-06: Fresh start re-run confirmed the app boots and renders the main comparison panel before any catalog interaction."
  debug_session: ".planning/debug/phase-05-show-catalog-mobile.md"

- truth: "On first load, the catalog panel is hidden and the toggle reads 'Show Catalog'. Clicking it reveals the search and issuer filter controls."
  status: closed
  reason: "Mobile-height expansion now scrolls the first revealed catalog control into view, making the tap result visible immediately."
  severity: resolved
  test: 3
  root_cause: "Catalog expansion works, but the revealed controls remain below the fold on mobile-height viewports, so users do not see visible change after tapping Show Catalog."
  artifacts:
    - path: "app.js"
      issue: "Toggle handler now flags only the open action for a one-time post-render catalog reveal."
    - path: "app.js"
      issue: "renderCatalog now scrolls the first catalog control into view on short viewports when the revealed content would otherwise stay below the fold."
  missing:
    - "[done] Opening the catalog now brings the panel's first revealed control into view on mobile-height viewports."
    - "[done] Firefox mobile-viewport verification confirmed the search and issuer controls are visible immediately after expansion."
  verification:
    - "2026-03-06: Firefox Playwright run at 390x844 showed the search box at the top of the viewport immediately after tapping Show Catalog."
  debug_session: ".planning/debug/mobile-show-catalog-phase-05.md"
