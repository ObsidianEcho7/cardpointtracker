---
phase: 05
slug: mixed-wallet-ux-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` |
| **Config file** | none |
| **Quick run command** | `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs` |
| **Full suite command** | `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs tests/catalog-core.test.mjs` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs`
- **After every plan wave:** Run `node --test tests/comparison-core.test.mjs tests/wallet-core.test.mjs tests/catalog-core.test.mjs`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | WAL-03 | unit/regression | `node --test tests/comparison-core.test.mjs` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | WAL-03 | unit/regression | `node --test tests/wallet-core.test.mjs tests/comparison-core.test.mjs` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | WAL-03 | static/smoke | `node --check app.js && rg -n "catalog-toggle|aria-expanded|catalog-collapsed|Add Card|Popular Card Catalog" index.html app.js styles.css` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | WAL-03 | static/smoke | `node --check app.js && rg -n "View all|Show fewer|ranking-more-count|ranking-expand" app.js styles.css index.html` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Compare-first screen scan feels intuitive on desktop and mobile | WAL-03 | Visual clarity and reading order are subjective product checks | Run the app locally, confirm Compare appears first, Add Card precedes Catalog, and the screen still feels easy to scan with mixed wallet data. |
| Collapsed catalog still feels discoverable and usable after expansion | WAL-03 | Browser interaction quality is better assessed in the real UI | Load the app, confirm Catalog starts collapsed, expand it, and verify search/filter/add behavior still works without awkward resets. |
| Top-4 ranking plus expansion reads clearly for wallets with more than four qualifying cards | WAL-03 | Requires real browser rendering and human comprehension | Seed or create 5+ qualifying cards, confirm only 4 show initially, use the expand affordance, and verify the full list remains understandable. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
