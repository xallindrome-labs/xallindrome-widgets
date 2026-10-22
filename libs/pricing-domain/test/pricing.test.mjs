import test from "node:test";
import assert from "node:assert/strict";
import {
  EXAMPLE_PRICING_CONFIG,
  calculatePricing,
  parsePricingConfig,
  toPublicPricingEstimate
} from "../dist/index.js";

test("package price + overage + add-ons add up", () => {
  const result = calculatePricing(
    { packageKey: "starter", premiumUnits: 2, baseUnits: 5, selectedAddOnKeys: ["monthly_review"] },
    EXAMPLE_PRICING_CONFIG
  );
  // 500 package + 2*40 + 5*20 + 150 add-on
  assert.equal(result.totalMonthlyRevenue, 830);
  assert.equal(result.totalUnits, 17);
  assert.equal(result.extraRevenue, 180);
  assert.equal(result.monthlyMargin, 830); // overhead defaults to 0
});

test("unknown package and bad counts are rejected", () => {
  const input = { packageKey: "starter", premiumUnits: 0, baseUnits: 0, selectedAddOnKeys: [] };
  assert.throws(() => calculatePricing({ ...input, packageKey: "nope" }, EXAMPLE_PRICING_CONFIG), /Invalid package key/);
  assert.throws(() => calculatePricing({ ...input, premiumUnits: -1 }, EXAMPLE_PRICING_CONFIG), /non-negative/);
  assert.throws(() => calculatePricing({ ...input, baseUnits: 1.5 }, EXAMPLE_PRICING_CONFIG), /non-negative/);
});

test("duplicate add-on keys count once", () => {
  const result = calculatePricing(
    { packageKey: "none", premiumUnits: 0, baseUnits: 0, selectedAddOnKeys: ["priority_support", "priority_support"] },
    EXAMPLE_PRICING_CONFIG
  );
  assert.equal(result.addOnSubtotal, 100);
});

test("parsePricingConfig returns null for empty or malformed input", () => {
  assert.equal(parsePricingConfig(""), null);
  assert.equal(parsePricingConfig("{not json"), null);
  assert.equal(parsePricingConfig("{}"), null);
  const ok = parsePricingConfig(JSON.stringify({ packages: [{ key: "a", name: "A", price: 10, units: 1 }] }));
  assert.equal(ok.packages[0].key, "a");
  assert.equal(ok.premiumUnitPrice, EXAMPLE_PRICING_CONFIG.premiumUnitPrice);
});

test("public estimate hides margin", () => {
  const result = calculatePricing(
    { packageKey: "growth", premiumUnits: 0, baseUnits: 0, selectedAddOnKeys: [] },
    { ...EXAMPLE_PRICING_CONFIG, fixedOverhead: 99 }
  );
  assert.equal("monthlyMargin" in toPublicPricingEstimate(result), false);
});
