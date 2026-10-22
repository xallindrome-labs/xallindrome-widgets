# @xallindrome-labs/pricing-domain

A small, dependency-free pricing model: a base package, per-unit overage and monthly add-ons. Pure functions, so it runs the same in a browser widget, a serverless function or a test. "Unit" is whatever you sell in quantity (posts, hours, seats, deliverables).

```bash
npm install @xallindrome-labs/pricing-domain
```

```js
import { calculatePricing, EXAMPLE_PRICING_CONFIG } from "@xallindrome-labs/pricing-domain";

const result = calculatePricing(
  { packageKey: "starter", premiumUnits: 2, baseUnits: 5, selectedAddOnKeys: ["monthly_review"] },
  EXAMPLE_PRICING_CONFIG
);
console.log(result.totalMonthlyRevenue); // 830
```

Also exported: `parsePricingConfig` / `parsePublicPricingConfig` (JSON string to config, `null` if malformed), `toPublicPricingConfigResponse` and `toPublicPricingEstimate` (shape output for visitors, without margin or overhead), and the TypeScript types. `EXAMPLE_PRICING_CONFIG` holds example numbers only; replace them with your own.

Part of [xallindrome-widgets](https://github.com/xallindrome-labs/xallindrome-widgets). MIT licensed.

---

**Built by [Xallindrome](https://xallindrome.co)**: we build automation and AI workflows for small businesses. If you'd like something like this for your business, [book a diagnostic](https://xallindrome.co).
