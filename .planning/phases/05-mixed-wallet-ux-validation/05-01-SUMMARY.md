---
phase: 05-mixed-wallet-ux-validation
plan: 01
subsystem: testing
tags: [wallet, comparison, ranking, normalization, regression]
requires:
  - phase: 04-card-type-rules-editability
    provides: Origin-aware wallet normalization and mixed-wallet CRUD comparison coverage
provides:
  - Source-neutral comparison ordering for equivalent custom and catalog reward profiles
  - Deterministic fallback ids for legacy custom wallet cards without persisted ids
  - Regression coverage for empty, single-source, and mixed-wallet normalization through ranking output
affects: [phase-05-ui-polish, comparison-core, wallet-core, mixed-wallet-ranking]
tech-stack:
  added: []
  patterns: [id-backed comparison tie-breaking, content-derived legacy custom ids, node-test mixed-wallet parity regressions]
key-files:
  created: [.planning/phases/05-mixed-wallet-ux-validation/05-01-SUMMARY.md]
  modified: [comparison-core.js, wallet-core.js, tests/comparison-core.test.mjs, tests/wallet-core.test.mjs]
key-decisions:
  - "Use normalized card id as the final comparison tie-breaker so equal-name mixed-source cards stop depending on input order."
  - "Derive fallback custom ids from stable card content instead of Date.now() so legacy reloads stay comparison-safe."
patterns-established:
  - "Comparison ordering should be total and deterministic: multiplier, then normalized name, then normalized card id."
  - "Legacy wallet normalization must avoid wall-clock-derived identifiers when ranking stability depends on normalized ids."
requirements-completed: [WAL-03]
duration: 2 min
completed: 2026-03-06
---

# Phase 05 Plan 01: Mixed Wallet Ranking Validation Summary

**Source-neutral ranking parity for custom and catalog cards, plus deterministic legacy custom normalization across mixed-wallet reloads.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-06T02:18:44Z
- **Completed:** 2026-03-06T02:21:04Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Locked direct-match and `other` fallback parity for equivalent custom and catalog cards with regression coverage.
- Made comparison ordering deterministic for equal-name mixed-source ties by extending the scorer's final tie-breaker.
- Stabilized legacy custom-card normalization so mixed-wallet ranking stays identical across reloads even when persisted ids are missing.

## Task Commits

Each task was committed atomically:

1. **Task 1: Lock comparison parity for equivalent custom and catalog reward profiles** - `ad09ac0` (test), `6568b74` (fix)
2. **Task 2: Validate normalized mixed-wallet edge cases from wallet input through ranking output** - `e1ff655` (test), `fbbe20a` (fix)

**Plan metadata:** Pending docs commit for summary/state/roadmap/requirements updates.

## Files Created/Modified
- `.planning/phases/05-mixed-wallet-ux-validation/05-01-SUMMARY.md` - Captures execution results, decisions, and verification for Plan 05-01.
- `comparison-core.js` - Added a normalized card-id tie-breaker after multiplier and name ordering.
- `wallet-core.js` - Replaced `Date.now()` legacy custom id fallback with deterministic content-derived ids.
- `tests/comparison-core.test.mjs` - Added parity and reload-stability regressions for mixed-source direct-match and fallback ranking.
- `tests/wallet-core.test.mjs` - Added normalization regressions for deterministic legacy ids and empty/single-card edge shapes.

## Decisions Made
- Use normalized card ids only as a final comparison tie-break after multiplier and alphabetical ordering so ranking stays source-neutral while becoming fully deterministic.
- Keep legacy custom-card normalization within `wallet-core.js` and derive fallback ids from stable card content rather than introducing any new storage migration path.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- WAL-03 is now protected by deterministic mixed-wallet parity regressions.
- Phase 05-02 can focus on compare-first UI polish without reopening ranking correctness questions.

## Self-Check: PASSED

- Found `.planning/phases/05-mixed-wallet-ux-validation/05-01-SUMMARY.md`.
- Verified task commits `ad09ac0`, `6568b74`, `e1ff655`, and `fbbe20a` exist in git history.

---
*Phase: 05-mixed-wallet-ux-validation*
*Completed: 2026-03-06*
