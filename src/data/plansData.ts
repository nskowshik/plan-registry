export interface Plan {
  id: string;
  name: string;
  price?: string;
  description?: string;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface SubColumn {
  id: string;
  name: string;
}

export interface FeatureData {
  canEnabled: boolean;
  canEnabledWithFlag: boolean;
  canEnabledInTrial: boolean;
  upsellPlanId: string | null;
  upsellAddonId: string | null;
}

export interface Feature {
  id: string;
  name: string;
  // plans[planId][subColumnId] = value from JSON
  plans: Record<string, Record<string, any>>;
}

// Dynamically import all JSON files from plans directory
const jsonModules = import.meta.glob("./plans/*.json", { eager: true });

// Build plan data map from imported JSON files
const planDataMap: Record<string, Record<string, FeatureData>> = {};
const plansList: Plan[] = [];
const popularPlan = ["prime_plus", "super_plus"];
const activePlans = [
  "standard-rmm-2024",
  "standard-psa-2024",
  "pro-2024",
  "super-2024",
  "super_plus",
  "prime",
  "prime_plus",
];

Object.entries(jsonModules).forEach(([path, module]) => {
  // Extract filename without extension from path like '../../../starter.json'
  const filename = path.split("/").pop()?.replace(".json", "") || "";
  const planId = filename.toLowerCase();

  // Add to plan data map
  planDataMap[planId] = (module as any).default as Record<string, FeatureData>;

  // Create plan entry with capitalized name
  plansList.push({
    id: planId,
    name: filename
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim(),
    isPopular: popularPlan.includes(planId),
    isActive: activePlans.includes(planId),
  });
});

// Sort plans: active plans first, then NFR plans, then others (alphabetically within each group)
export const plans: Plan[] = plansList.sort((a, b) => {
  // Check if plans are active
  const aIsActive = a.isActive ?? false;
  const bIsActive = b.isActive ?? false;

  // Check if plans are NFR (case-insensitive)
  const aIsNFR =
    a.name.toLowerCase().includes("nfr") ||
    a.id.toLowerCase().includes("not-for-resale");
  const bIsNFR =
    b.name.toLowerCase().includes("nfr") ||
    b.id.toLowerCase().includes("not-for-resale");

  // Priority: active > NFR > others
  if (aIsActive && !bIsActive) return -1;
  if (!aIsActive && bIsActive) return 1;

  // Both active or both not active, check NFR
  if (!aIsActive && !bIsActive) {
    if (aIsNFR && !bIsNFR) return -1;
    if (!aIsNFR && bIsNFR) return 1;
  }

  // Same category, sort alphabetically
  return a.name.localeCompare(b.name);
});

// Sub-columns are the JSON keys (canEnabled, canEnabledWithFlag, etc.)
export const subColumns: SubColumn[] = [
  { id: "canEnabled", name: "Enabled" },
  { id: "canEnabledWithFlag", name: "With Flag" },
  { id: "canEnabledInTrial", name: "In Trial" },
];

// Extract all unique feature names from all plan JSONs
const getAllFeatureNames = (): string[] => {
  const featureSet = new Set<string>();
  Object.values(planDataMap).forEach((planData) => {
    Object.keys(planData).forEach((featureName) => featureSet.add(featureName));
  });
  return Array.from(featureSet).sort();
};

// Format feature name by removing special characters and replacing with spaces
const formatFeatureName = (featureName: string): string => {
  return featureName
    .replace(/[^a-zA-Z0-9]+/g, " ") // Replace all special characters with space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
};

// Helper to create default plan values from JSON data
export const createDefaultPlanValues = (): Record<
  string,
  Record<string, any>
> => {
  return plans.reduce(
    (acc, plan) => ({
      ...acc,
      [plan.id]: subColumns.reduce(
        (subAcc, subCol) => ({
          ...subAcc,
          [subCol.id]: false,
        }),
        {
          upsellPlanId: null,
          upsellAddonId: null,
        } as Record<string, any>,
      ),
    }),
    {} as Record<string, Record<string, any>>,
  );
};

// Build features array from JSON data
const buildFeaturesFromJSON = (): Feature[] => {
  const featureNames = getAllFeatureNames();

  return featureNames.map((featureName) => {
    const planValues: Record<string, Record<string, any>> = {};

    plans.forEach((plan) => {
      const planData = planDataMap[plan.id];
      const featureData = planData?.[featureName];
      planValues[plan.id] = featureData;
    });

    return {
      id: featureName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: formatFeatureName(featureName),
      plans: planValues,
    };
  });
};

export const features: Feature[] = buildFeaturesFromJSON();
