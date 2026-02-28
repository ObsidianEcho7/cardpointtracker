import test from "node:test";
import assert from "node:assert/strict";

import catalogCore from "../catalog-core.js";

const {
  CATALOG_SEED,
  CATALOG_REFERENCE_SEED,
  buildCatalogCards,
  normalizeCatalogCard,
  normalizeRewardEntries,
  getCatalogIssuers,
  filterCatalogCards,
} = catalogCore;

test("buildCatalogCards returns normalized fixed catalog entries", () => {
  const cards = buildCatalogCards();
  assert.ok(cards.length > CATALOG_SEED.length);
  assert.ok(cards.length <= CATALOG_SEED.length + CATALOG_REFERENCE_SEED.length);

  const withRewards = cards.filter((card) => card.rewards.length > 0);
  const withoutRewards = cards.filter((card) => card.rewards.length === 0);
  assert.ok(withRewards.length >= CATALOG_SEED.length);
  assert.ok(withoutRewards.length > 0);

  cards.forEach((card) => {
    assert.ok(card.id);
    assert.ok(card.name);
    assert.ok(card.issuer);
    assert.ok(card.network);
    assert.ok(Array.isArray(card.rewards));
    assert.ok(typeof card.link === "string");
    if (card.link) {
      assert.ok(card.link.startsWith("https://") || card.link.startsWith("http://"));
    }

    card.rewards.forEach((reward) => {
      assert.ok(reward.category);
      assert.ok(Number.isFinite(reward.multiplier));
      assert.ok(reward.multiplier > 0);
    });
  });
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
      network: "  Visa ",
      link: "https://example.com/card",
      rewards: {
        groceries: 3,
      },
    },
    0,
  );

  assert.equal(card.id, "test-bank-test-card");
  assert.equal(card.name, "Test Card");
  assert.equal(card.issuer, "Test Bank");
  assert.equal(card.network, "Visa");
  assert.equal(card.link, "https://example.com/card");
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

test("filterCatalogCards treats issuer matching as case-insensitive exact match", () => {
  const cards = buildCatalogCards();
  const lower = filterCatalogCards(cards, { issuer: "american express", searchTerm: "" });
  const spaced = filterCatalogCards(cards, { issuer: "  American Express  ", searchTerm: "" });

  assert.deepEqual(
    lower.map((card) => card.name),
    spaced.map((card) => card.name),
  );
  assert.ok(lower.length > 0);
  assert.ok(lower.every((card) => card.issuer === "American Express"));
});

test("buildCatalogCards collapses known near-duplicate product aliases", () => {
  const cards = buildCatalogCards();
  const names = new Set(cards.map((card) => card.name));

  assert.equal(names.has("Capital One Venture X"), true);
  assert.equal(names.has("Venture X Rewards"), false);

  assert.equal(names.has("Capital One Savor"), true);
  assert.equal(names.has("Savor Rewards"), false);

  assert.equal(names.has("Capital One Quicksilver"), true);
  assert.equal(names.has("Quicksilver Rewards"), false);

  assert.equal(names.has("Amazon Prime Visa"), true);
  assert.equal(names.has("Prime Visa"), false);

  assert.equal(names.has("Bank of America Customized Cash Rewards"), true);
  assert.equal(names.has("Customized Cash Rewards"), false);

  assert.equal(names.has("Bank of America Premium Rewards"), true);
  assert.equal(names.has("Premium Rewards"), false);
});
