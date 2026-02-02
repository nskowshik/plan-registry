import JSZip from "jszip";
import { Feature, Plan } from "../types";

export const exportFeaturesToJSON = async (features: Feature[], visiblePlans: Plan[]) => {
  const zip = new JSZip();

  visiblePlans.forEach((plan) => {
    const planData: Record<string, any> = {};

    features.forEach((feature) => {
      const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");
      planData[featureKey] = feature.plans[plan.id] || {};
    });

    zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gating-json-${new Date().toString()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
