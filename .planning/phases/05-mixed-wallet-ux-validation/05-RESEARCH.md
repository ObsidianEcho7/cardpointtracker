# Phase 5: Mixed Wallet UX Validation - Research

**Researched:** 2026-03-06
**Domain:** Mixed-wallet comparison validation and lightweight vanilla JS UI polish
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Main-screen emphasis and flow
- The app should feel compare-first for someone landing on the main screen.
- Section order should be: Compare, Your Cards, Add Card, then Catalog.
- The catalog remains available on the main screen but should be collapsed by default.

### Comparison presentation
- The main comparison view should show only the top 4 qualifying cards to keep the screen clean.
- If more than 4 cards qualify, provide an expandable "View all" option rather than showing the full list immediately.
- Keep the top recommendation terse: card name plus multiplier only.

### Final polish scope
- Keep Phase 5 polish minimal and functional rather than adding heavy UX treatment.
- Do not add extra custom-vs-catalog visual distinction inside the comparison experience beyond the current UI approach.
- Continue treating the wallet list as the primary place where custom vs catalog state is visibly differentiated.

### Claude's Discretion
- Exact expand/collapse interaction design and copy for the catalog section.
- Exact "View all" interaction copy and any companion collapse behavior for the ranking list.
- Minor copy refinements and spacing adjustments as long as the compare-first layout and minimal-polish intent remain intact.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WAL-03 | Ranking logic applies to both custom and catalog cards using the same category/fallback rules | Preserve origin-neutral scoring in `comparison-core.js`, validate normalized mixed-wallet inputs through `wallet-core.js`, and lock parity with regression tests before UI polish work. |

</phase_requirements>

## Summary

Phase 5 should stay on the app's existing architecture: pure ranking logic in `comparison-core.js`, normalized wallet entities from `wallet-core.js`, and all UI wiring in `app.js`, `index.html`, and `styles.css`. No new framework, router, or test harness is warranted for this scope. The fastest safe path is to use the current `node:test` suite to lock mixed-wallet parity first, then apply the compare-first UI refinements as a second plan.

The codebase already enforces catalog/custom origin behavior in the wallet list while keeping comparison rendering source-agnostic. That means the main technical risk is not missing infrastructure, but unintentionally reintroducing source-sensitive ranking behavior or hiding too much information when truncating the ranking list. The planning work should therefore front-load regression coverage for custom-only, catalog-only, and mixed wallets, then implement the top-4 and collapsed-catalog UI as incremental changes on top of those guarantees.

**Primary recommendation:** Keep Phase 5 dependency-free, test ranking parity first, and ship the UI polish as lightweight updates inside the existing render pipeline.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Browser DOM APIs | built-in | Render compare, wallet, catalog, and form panels | The app already uses direct DOM rendering with no component framework, and Phase 5 only needs incremental UI adjustments. |
| IndexedDB | built-in | Persist wallet cards locally | Existing card state already depends on IndexedDB; no storage changes are needed for this phase. |
| `node:test` | built-in | Automated regression coverage for ranking and wallet logic | The repo already has fast green tests covering catalog, wallet, and comparison behavior. |
| `node --check` | built-in | Syntax validation for browser-side scripts | Fast automated safety net for `app.js`, `comparison-core.js`, `wallet-core.js`, and related files. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rg` | local CLI | Fast structural verification for UI strings/selectors in plan automation | Use for lightweight automated checks when UI work is too small to justify new test infrastructure. |
| Static HTTP server (`python3 -m http.server 8080`) | built-in | Manual acceptance pass for browser behavior | Use after automated checks to verify compare-first layout, collapsed catalog, and ranking expansion in-browser. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing vanilla render pipeline | React/Vue/component framework | Massive scope expansion for a polish/validation phase; would violate the project's low-rewrite constraint. |
| Existing `node:test` suite | Vitest/Jest + jsdom | Adds setup cost without solving a current blocker; existing tests already run quickly and cover core ranking logic. |
| Inline panel collapse in current DOM | Dedicated accordion library | Unnecessary dependency for a single collapsed catalog section. |

**Installation:**
```bash
# None required for this phase
```

## Architecture Patterns

### Recommended Project Structure
```text
cardtracker/
├── app.js                  # UI state, DOM events, render pipeline
├── comparison-core.js      # Source-agnostic scoring rules
├── wallet-core.js          # Wallet normalization and origin semantics
├── index.html              # Panel order and static shell
├── styles.css              # Panel, ranking, and collapsed-state styling
└── tests/
    ├── comparison-core.test.mjs
    ├── wallet-core.test.mjs
    └── catalog-core.test.mjs
```

### Pattern 1: Keep scoring logic source-agnostic
**What:** All ranking decisions should continue to flow through normalized wallet entities plus `comparison-core.js`, not through UI-only origin checks.
**When to use:** Any change that affects sorted results, fallback labels, ranking truncation, or edge-case ranking inputs.
**Example:**
```js
// Source: /Users/ryan/Development/cardtracker/app.js
const comparisonCards = walletCore.normalizeWalletCards(state.cards);
const scored = comparisonCore.computeComparisonResults(comparisonCards, category);
```

### Pattern 2: Layer UI polish onto the existing render cycle
**What:** Reorder or collapse panels by adjusting the current HTML structure and render/event logic rather than introducing a new state-management abstraction.
**When to use:** Compare-first layout changes, collapsed catalog behavior, and "View all" ranking reveal.
**Example:**
```js
// Source: /Users/ryan/Development/cardtracker/app.js
function render() {
  renderCards();
  renderComparison();
  renderCatalog();
}
```

### Pattern 3: Prefer fast regression coverage over new infrastructure
**What:** Extend existing `node:test` files for ranking invariants and use simple automated structural checks for lightweight UI polish.
**When to use:** Validating mixed-wallet parity, fallback behavior, and small DOM/render changes.
**Example:**
```bash
# Source: existing local workflow usage
node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs tests/catalog-core.test.mjs
node --check app.js wallet-core.js comparison-core.js catalog-core.js
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collapsible catalog panel | Custom state machine or animation framework | Small boolean UI state in `app.js` plus semantic toggle markup/styling | The feature is a single collapsed section, not a reusable interaction system. |
| Ranking parity validation | Manual spreadsheet-style verification only | Expand `node:test` coverage around comparison and wallet fixtures | Automated parity checks are already fast and prevent regressions better than manual spot checks alone. |
| UI regression harness | New E2E stack for one phase | `node --check`, targeted `rg` assertions, and final browser acceptance pass | The app has no existing E2E harness, and Phase 5 scope does not justify one. |

**Key insight:** This phase benefits more from preserving proven local patterns than from introducing new tooling.

## Common Pitfalls

### Pitfall 1: Letting origin type leak into ranking decisions
**What goes wrong:** Comparison behavior starts differing between custom and catalog cards even when reward data matches.
**Why it happens:** UI/source metadata gets mixed into scoring or sorting assumptions.
**How to avoid:** Keep ranking tests centered on equivalent reward fixtures across custom and catalog origins and continue normalizing cards before scoring.
**Warning signs:** Custom and catalog versions of the same reward profile rank differently, or fallback labels diverge by source.

### Pitfall 2: Hiding relevant ranking information when truncating to four cards
**What goes wrong:** Users only see four cards and cannot tell more results exist.
**Why it happens:** List truncation is implemented without a disclosure mechanism.
**How to avoid:** Couple truncation with an explicit "View all" affordance and companion collapse behavior.
**Warning signs:** Wallet has 5+ qualifying cards but the UI looks like the full list is complete.

### Pitfall 3: Collapsing the catalog in a way that breaks discoverability
**What goes wrong:** The catalog becomes technically present but practically invisible or state-losing.
**Why it happens:** Collapse is treated as removal rather than a lower-priority, recoverable section.
**How to avoid:** Default to collapsed, but keep the toggle obvious and preserve current search/filter/add behavior once expanded.
**Warning signs:** Search/filter inputs reset unexpectedly or add-to-wallet interactions only work after a full rerender.

### Pitfall 4: Expanding scope under the label of "polish"
**What goes wrong:** Phase 5 turns into a redesign or new capability phase.
**Why it happens:** "Validation" work invites unrelated changes such as new badges, deeper comparison explanations, or new catalog flows.
**How to avoid:** Treat Phase 5 as validation + minimal functional polish only, per the locked context.
**Warning signs:** Tasks start adding new feature surfaces rather than clarifying the existing ones.

## Code Examples

Verified local patterns:

### Origin-neutral comparison input assembly
```js
// Source: /Users/ryan/Development/cardtracker/app.js
const comparisonCards = walletCore.normalizeWalletCards(state.cards);
const scored = comparisonCore.computeComparisonResults(comparisonCards, category);
```

### Current terse top-card callout
```js
// Source: /Users/ryan/Development/cardtracker/app.js
els.result.innerHTML = `Best card for <strong>${escapeHtml(categoryLabel)}</strong>: <strong>${escapeHtml(best.card.name)}</strong> at <strong>${comparisonCore.formatMultiplier(best.multiplier)}</strong>.`;
```

### Existing fast mixed-wallet regression baseline
```js
// Source: /Users/ryan/Development/cardtracker/tests/comparison-core.test.mjs
assert.deepEqual(
  computeComparisonResults(afterCreate, "travel").map((entry) => entry.card.name),
  ["Beta Custom", "Alpha Custom", "Capital One Venture X"],
);
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in Node runner) |
| Config file | none |
| Quick run command | `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs` |
| Full suite command | `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs tests/catalog-core.test.mjs` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WAL-03 | Custom and catalog cards use the same category/fallback ranking rules when reward data is equivalent | unit/regression | `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs` | ✅ |

### Sampling Rate
- **Per task commit:** `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs`
- **Per wave merge:** `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs tests/catalog-core.test.mjs`
- **Phase gate:** Full suite green before `$gsd-verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers the phase requirement and current regression surface.

## Sources

### Primary (HIGH confidence)
- `/Users/ryan/Development/cardtracker/.planning/phases/05-mixed-wallet-ux-validation/05-CONTEXT.md` - locked product decisions for Phase 5
- `/Users/ryan/Development/cardtracker/.planning/ROADMAP.md` - Phase 5 goal, success criteria, and plan slots
- `/Users/ryan/Development/cardtracker/.planning/REQUIREMENTS.md` - WAL-03 requirement definition
- `/Users/ryan/Development/cardtracker/app.js` - compare, wallet, and catalog render/event implementation
- `/Users/ryan/Development/cardtracker/comparison-core.js` - ranking logic implementation
- `/Users/ryan/Development/cardtracker/wallet-core.js` - normalized wallet entity/origin handling
- `/Users/ryan/Development/cardtracker/tests/comparison-core.test.mjs` - ranking regression coverage
- `/Users/ryan/Development/cardtracker/tests/wallet-core.test.mjs` - mixed-wallet normalization and origin regression coverage
- `/Users/ryan/Development/cardtracker/tests/catalog-core.test.mjs` - existing catalog-core automated baseline

### Secondary (MEDIUM confidence)
- None needed — current repo inspection answered the planning questions directly.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no external dependencies are needed and the current stack is directly observable.
- Architecture: HIGH - the relevant render/state/test patterns are already present in the repo.
- Pitfalls: HIGH - they follow directly from the locked Phase 5 decisions and current implementation shape.

**Research date:** 2026-03-06
**Valid until:** 2026-04-05
