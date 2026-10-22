/**
 * Small, dependency-free pricing model: a base package plus per-unit overage
 * and monthly add-ons. Pure functions only, so it runs in a browser widget,
 * a serverless function or a test the same way.
 *
 * "Unit" is whatever you sell in quantity (posts, hours, seats, deliverables).
 */

export type PricingPackage = {
  key: string;
  name: string;
  /** Monthly price of the package. */
  price: number;
  /** Units included in the package. */
  units: number;
};

export type PricingAddOn = {
  key: string;
  name: string;
  monthlyPrice: number;
};

export type PricingConfig = {
  /** Price of one extra "premium" unit beyond the package. */
  premiumUnitPrice: number;
  /** Price of one extra "base" unit beyond the package. */
  baseUnitPrice: number;
  /** Your fixed monthly cost, used only for the margin figure. Defaults to 0. */
  fixedOverhead?: number;
  packages: PricingPackage[];
  addOns: PricingAddOn[];
};

export type PublicPricingPackage = PricingPackage & {
  description?: string;
  priceCue?: string;
};

export type PublicPricingConfig = {
  premiumUnitPrice: number;
  baseUnitPrice: number;
  fixedOverhead?: number;
  packages: PublicPricingPackage[];
  addOns: PricingAddOn[];
  disclaimer?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  premiumUnitLabel?: string;
  baseUnitLabel?: string;
};

export type PricingCalculationInput = {
  packageKey: string;
  premiumUnits: number;
  baseUnits: number;
  selectedAddOnKeys: string[];
};

export type PricingCalculationResult = {
  packageName: string;
  basePrice: number;
  packageUnits: number;
  premiumUnits: number;
  premiumRevenue: number;
  baseUnits: number;
  baseRevenue: number;
  activeAddOns: PricingAddOn[];
  addOnSubtotal: number;
  extraUnits: number;
  extraRevenue: number;
  totalMonthlyRevenue: number;
  totalUnits: number;
  effectivePricePerUnit: number;
  monthlyMargin: number;
};

export type PublicPricingConfigResponse = {
  packages: Array<{
    key: string;
    name: string;
    description?: string;
    priceCue: string;
  }>;
  premiumUnitPrice: number;
  baseUnitPrice: number;
  premiumUnitLabel: string;
  baseUnitLabel: string;
  disclaimer: string;
  ctaLabel: string;
  ctaUrl: string;
};

export type PublicPricingEstimate = {
  packageName: string;
  premiumUnits: number;
  baseUnits: number;
  extraRevenue: number;
  totalMonthlyRevenue: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

/** Example numbers only. Replace them with your own pricing. */
export const EXAMPLE_PRICING_CONFIG: PricingConfig = {
  premiumUnitPrice: 40,
  baseUnitPrice: 20,
  packages: [
    { key: "starter", name: "Starter", price: 500, units: 10 },
    { key: "growth", name: "Growth", price: 1200, units: 30 },
    { key: "scale", name: "Scale", price: 2500, units: 80 },
    { key: "none", name: "No Base Package", price: 0, units: 0 }
  ],
  addOns: [
    { key: "monthly_review", name: "Monthly Review Call", monthlyPrice: 150 },
    { key: "priority_support", name: "Priority Support", monthlyPrice: 100 }
  ]
};

export const EXAMPLE_PUBLIC_PRICING_CONFIG: PublicPricingConfig = {
  premiumUnitPrice: EXAMPLE_PRICING_CONFIG.premiumUnitPrice,
  baseUnitPrice: EXAMPLE_PRICING_CONFIG.baseUnitPrice,
  packages: EXAMPLE_PRICING_CONFIG.packages.map((pkg) => ({
    ...pkg,
    priceCue: pkg.price > 0 ? `Starts at ${formatCurrency(pkg.price)}/month` : "Custom add-ons only"
  })),
  addOns: EXAMPLE_PRICING_CONFIG.addOns,
  disclaimer:
    "Estimates are provided for planning only and may vary based on scope and requirements.",
  ctaLabel: "Book a call",
  ctaUrl: "https://example.com/book",
  premiumUnitLabel: `Premium units (${formatCurrency(EXAMPLE_PRICING_CONFIG.premiumUnitPrice)} each)`,
  baseUnitLabel: `Base units (${formatCurrency(EXAMPLE_PRICING_CONFIG.baseUnitPrice)} each)`
};

function parsePackages(value: unknown[]): PricingPackage[] {
  return value.map((item) => {
    const pkg = item as Partial<PricingPackage>;
    return {
      key: String(pkg.key),
      name: String(pkg.name),
      price: Number(pkg.price),
      units: Number(pkg.units)
    };
  });
}

function parseAddOns(value: unknown, fallback: PricingAddOn[]): PricingAddOn[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  return value.map((item) => {
    const addOn = item as Partial<PricingAddOn>;
    return {
      key: String(addOn.key),
      name: String(addOn.name),
      monthlyPrice: Number(addOn.monthlyPrice)
    };
  });
}

/** Parses a JSON string into a PricingConfig. Returns null if it is empty or malformed. */
export function parsePricingConfig(
  value: string | undefined | null,
  fallback: PricingConfig = EXAMPLE_PRICING_CONFIG
): PricingConfig | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Partial<PricingConfig>;
    if (!Array.isArray(parsed.packages)) {
      return null;
    }
    return {
      premiumUnitPrice: Number(parsed.premiumUnitPrice ?? fallback.premiumUnitPrice),
      baseUnitPrice: Number(parsed.baseUnitPrice ?? fallback.baseUnitPrice),
      fixedOverhead: Number(parsed.fixedOverhead ?? fallback.fixedOverhead ?? 0),
      packages: parsePackages(parsed.packages),
      addOns: parseAddOns(parsed.addOns, fallback.addOns)
    };
  } catch {
    return null;
  }
}

/** Parses a JSON string into a PublicPricingConfig. Returns null if it is empty or malformed. */
export function parsePublicPricingConfig(
  value: string | undefined | null,
  fallback: PublicPricingConfig = EXAMPLE_PUBLIC_PRICING_CONFIG
): PublicPricingConfig | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Partial<PublicPricingConfig>;
    if (!Array.isArray(parsed.packages)) {
      return null;
    }
    const str = (v: unknown, fb: string | undefined) => (typeof v === "string" ? v : fb);
    return {
      premiumUnitPrice: Number(parsed.premiumUnitPrice ?? fallback.premiumUnitPrice),
      baseUnitPrice: Number(parsed.baseUnitPrice ?? fallback.baseUnitPrice),
      fixedOverhead: Number(parsed.fixedOverhead ?? fallback.fixedOverhead ?? 0),
      packages: parsed.packages.map((item) => {
        const pkg = item as Partial<PublicPricingPackage>;
        return {
          key: String(pkg.key),
          name: String(pkg.name),
          price: Number(pkg.price),
          units: Number(pkg.units),
          description: str(pkg.description, undefined),
          priceCue: str(pkg.priceCue, undefined)
        };
      }),
      addOns: parseAddOns(parsed.addOns, fallback.addOns),
      disclaimer: str(parsed.disclaimer, fallback.disclaimer),
      ctaLabel: str(parsed.ctaLabel, fallback.ctaLabel),
      ctaUrl: str(parsed.ctaUrl, fallback.ctaUrl),
      premiumUnitLabel: str(parsed.premiumUnitLabel, fallback.premiumUnitLabel),
      baseUnitLabel: str(parsed.baseUnitLabel, fallback.baseUnitLabel)
    };
  } catch {
    return null;
  }
}

export function calculatePricing(
  input: PricingCalculationInput,
  config: PricingConfig
): PricingCalculationResult {
  if (
    !Number.isInteger(input.premiumUnits) ||
    !Number.isInteger(input.baseUnits) ||
    input.premiumUnits < 0 ||
    input.baseUnits < 0
  ) {
    throw new Error("Unit counts must be non-negative integers.");
  }

  const selectedPackage = config.packages.find((pkg) => pkg.key === input.packageKey);
  if (!selectedPackage) {
    throw new Error("Invalid package key.");
  }

  const fixedOverhead = Number(config.fixedOverhead ?? 0);
  const premiumRevenue = input.premiumUnits * config.premiumUnitPrice;
  const baseRevenue = input.baseUnits * config.baseUnitPrice;
  const selectedAddOnKeys = Array.isArray(input.selectedAddOnKeys)
    ? Array.from(new Set(input.selectedAddOnKeys.map((key) => String(key))))
    : [];
  const activeAddOns = config.addOns.filter((addOn) => selectedAddOnKeys.includes(addOn.key));
  const addOnSubtotal = activeAddOns.reduce((total, addOn) => total + addOn.monthlyPrice, 0);
  const extraRevenue = premiumRevenue + baseRevenue;
  const totalMonthlyRevenue = selectedPackage.price + extraRevenue + addOnSubtotal;
  const totalUnits = selectedPackage.units + input.premiumUnits + input.baseUnits;
  const effectivePricePerUnit = totalUnits > 0 ? totalMonthlyRevenue / totalUnits : 0;
  const monthlyMargin = totalMonthlyRevenue - fixedOverhead;

  return {
    packageName: selectedPackage.name,
    basePrice: selectedPackage.price,
    packageUnits: selectedPackage.units,
    premiumUnits: input.premiumUnits,
    premiumRevenue,
    baseUnits: input.baseUnits,
    baseRevenue,
    activeAddOns,
    addOnSubtotal: Number(addOnSubtotal.toFixed(2)),
    extraUnits: input.premiumUnits + input.baseUnits,
    extraRevenue,
    totalMonthlyRevenue,
    totalUnits,
    effectivePricePerUnit: Number(effectivePricePerUnit.toFixed(2)),
    monthlyMargin: Number(monthlyMargin.toFixed(2))
  };
}

/** Shapes a config for public display: no overhead, formatted price cues and labels. */
export function toPublicPricingConfigResponse(
  config: PublicPricingConfig
): PublicPricingConfigResponse {
  return {
    packages: config.packages.map((pkg) => ({
      key: pkg.key,
      name: pkg.name,
      description: pkg.description,
      priceCue:
        pkg.priceCue ??
        (pkg.price > 0 ? `Starts at ${formatCurrency(pkg.price)}/month` : "Custom add-ons only")
    })),
    premiumUnitPrice: config.premiumUnitPrice,
    baseUnitPrice: config.baseUnitPrice,
    premiumUnitLabel:
      config.premiumUnitLabel ?? `Premium units (${formatCurrency(config.premiumUnitPrice)} each)`,
    baseUnitLabel:
      config.baseUnitLabel ?? `Base units (${formatCurrency(config.baseUnitPrice)} each)`,
    disclaimer:
      config.disclaimer ??
      EXAMPLE_PUBLIC_PRICING_CONFIG.disclaimer ??
      "Estimates may vary by scope.",
    ctaLabel: config.ctaLabel ?? EXAMPLE_PUBLIC_PRICING_CONFIG.ctaLabel ?? "Book a call",
    ctaUrl: config.ctaUrl ?? EXAMPLE_PUBLIC_PRICING_CONFIG.ctaUrl ?? "https://example.com/book"
  };
}

/** Strips a calculation down to the fields that are safe to show a visitor (no margin, no overhead). */
export function toPublicPricingEstimate(result: PricingCalculationResult): PublicPricingEstimate {
  return {
    packageName: result.packageName,
    premiumUnits: result.premiumUnits,
    baseUnits: result.baseUnits,
    extraRevenue: result.extraRevenue,
    totalMonthlyRevenue: result.totalMonthlyRevenue
  };
}
