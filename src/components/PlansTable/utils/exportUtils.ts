import JSZip from "jszip";
import { Feature, Plan, ChangedFeature } from "../types";

// Helper function to get feature value with defaults
const getFeatureValue = (feature: Feature, planId: string) => {
  return feature.plans[planId] || {
    canEnabled: false,
    canEnabledWithFlag: false,
    canEnabledInTrial: false,
    upsellPlanId: null,
    upsellAddonId: null,
  };
};

export const exportFeaturesToJSON = async (features: Feature[], visiblePlans: Plan[]) => {
  const zip = new JSZip();

  visiblePlans.forEach((plan) => {
    const planData: Record<string, any> = {};

    features.forEach((feature) => {
      const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");
      planData[featureKey] = getFeatureValue(feature, plan.id);
    });

    zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gating-json-${new Date().toISOString()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportSmartJSON = async (
  features: Feature[],
  visiblePlans: Plan[],
  changedFeatures: Record<string, ChangedFeature>,
  newlyAddedPlans: string[],
  allPlans: Plan[],
  exportAllPlans: boolean
) => {
  const zip = new JSZip();
  
  // Check if there are any new features
  const hasNewFeatures = Object.values(changedFeatures).some(
    (change) => change.status === "NEW"
  );
  
  // If there are new features, export based on user choice (all plans or visible plans)
  if (hasNewFeatures) {
    const plansToExport = exportAllPlans ? allPlans : visiblePlans;
    
    plansToExport.forEach((plan) => {
      const planData: Record<string, any> = {};
      
      features.forEach((feature) => {
        const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");
        planData[featureKey] = getFeatureValue(feature, plan.id);
      });
      
      zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
    });
  }
  // If there are newly added plans, export only those plans
  else if (newlyAddedPlans.length > 0) {
    const newPlans = visiblePlans.filter((plan) => 
      newlyAddedPlans.includes(plan.id)
    );
    
    newPlans.forEach((plan) => {
      const planData: Record<string, any> = {};
      
      features.forEach((feature) => {
        const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");
        planData[featureKey] = getFeatureValue(feature, plan.id);
      });
      
      zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
    });
  }
  // If only features were modified/renamed, export only changed plans with full feature list
  else {
    // Collect all plans that have changes
    const changedPlanIds = new Set<string>();
    
    Object.values(changedFeatures).forEach((change) => {
      if (change.changes) {
        Object.keys(change.changes).forEach((planId) => {
          changedPlanIds.add(planId);
        });
      }
    });
    
    // Export only the plans that have changes, but with full feature list
    const changedPlans = visiblePlans.filter((plan) => 
      changedPlanIds.has(plan.id)
    );
    
    changedPlans.forEach((plan) => {
      const planData: Record<string, any> = {};
      
      // Include ALL features for this plan (full feature list)
      features.forEach((feature) => {
        const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");
        planData[featureKey] = getFeatureValue(feature, plan.id);
      });
      
      zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
    });
  }
  
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gating-json-${new Date().toISOString()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
