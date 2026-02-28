import test from "node:test";
import assert from "node:assert/strict";

import catalogCore from "../catalog-core.js";

const {
  CATALOG_SEED,
  buildCatalogCards,
  normalizeCatalogCard,
  normalizeRewardEntries,
  getCatalogIssuers,
  filterCatalogCards,
} = catalogCore;

test("buildCatalogCards returns normalized fixed catalog entries", () => {
  const cards = buildCatalogCards();
  assert.ok(cards.length >= 10);

  cards.forEach((card) => {
    assert.ok(card.id);
    assert.ok(card.name);
    assert.ok(card.issuer);
    assert.ok(Array.isArray(card.rewards));
    assert.ok(card.rewards.length > 0);

    card.rewards.forEach((reward) => {
      assert.ok(reward.category);
      assert.ok(Number.isFinite(reward.multiplier));
      assert.ok(reward.multiplier > 0);
    });
  });

  assert.equal(cards.length, CATALOG_SEED.length);
});

test("normalizeRewardEntries deduplicates categories and keeps highest multiplier", () => {
  const rewards = normalizeRewardEntries([
    { category: "dining", multiplier: 3 },
    { category: "dining", multiplier: 4 },
    { category: "gas", multiplier: "2" },
    { category: "gas", multiplier: -1 },
    { category: "", multiplier: 10 },
    { category: "other", multiplier: "oops" },
  ]);

  assert.deepEqual(rewards, [
    { category: "dining", multiplier: 4 },
    { category: "gas", multiplier: 2 },
  ]);
});

test("normalizeCatalogCard creates deterministic id and normalized fields", () => {
  const card = normalizeCatalogCard(
    {
      name: "  Test Card  ",
      issuer: "  Test Bank ",
      rewards: {
        groceries: 3,
      },
    },
    0,
  );

  assert.equal(card.id, "test-bank-test-card");
  assert.equal(card.name, "Test Card");
  assert.equal(card.issuer, "Test Bank");
  assert.deepEqual(card.rewards, [{ category: "groceries", multiplier: 3 }]);
});

test("getCatalogIssuers returns unique sorted issuers", () => {
  const issuers = getCatalogIssuers(buildCatalogCards());
  assert.equal(issuers[0], "American Express");
  assert.ok(issuers.includes("Chase"));
  assert.ok(issuers.includes("Citi"));
  assert.equal(new Set(issuers).size, issuers.length);
});

test("filterCatalogCards narrows by case-insensitive name search", () => {
  const cards = buildCatalogCards();
  const results = filterCatalogCards(cards, { searchTerm: "sapphire", issuer: "all" });

  assert.ok(results.length >= 2);
  assert.ok(results.every((card) => card.name.toLowerCase().includes("sapphire")));
});

test("filterCatalogCards combines issuer and search filters", () => {
  const cards = buildCatalogCards();
  const chaseSapphire = filterCatalogCards(cards, {
    issuer: "chase",
    searchTerm: "sapphire",
  });

  assert.ok(chaseSapphire.length >= 1);
  assert.ok(
    chaseSapphire.every(
      (card) =>
        card.issuer.toLowerCase() === "chase" &&
        card.name.toLowerCase().includes("sapphire"),
    ),
  );

  const noMatches = filterCatalogCards(cards, {
    issuer: "Discover",
    searchTerm: "Sapphire",
  });
  assert.equal(noMatches.length, 0);
});
