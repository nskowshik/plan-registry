import { useMemo } from "react";
import { Feature, ChangedFeature } from "../types";
import { plans } from "@/data/plansData";

export const useChangeTracking = (
  features: Feature[],
  originalFeatures: Feature[]
) => {
  const changedFeatures = useMemo(() => {
    const changes: Record<string, ChangedFeature> = {};

    const originalMap = new Map(
      originalFeatures.map((f) => [f.id, f])
    );

    features.forEach((feature) => {
      const original = originalMap.get(feature.id);

      if (!original) {
        changes[feature.name] = { status: "NEW" };
      } else if (original.name !== feature.name) {
        const planChanges: Record<string, any> = {};
        plans.forEach((plan) => {
          const oldPlan = original.plans[plan.id];
          const newPlan = feature.plans[plan.id];
          const subChanges: Record<string, { old: any; new: any }> = {};

          if (oldPlan?.canEnabled !== newPlan?.canEnabled) {
            subChanges.canEnabled = {
              old: oldPlan?.canEnabled,
              new: newPlan?.canEnabled,
            };
          }
          if (oldPlan?.canEnabledWithFlag !== newPlan?.canEnabledWithFlag) {
            subChanges.canEnabledWithFlag = {
              old: oldPlan?.canEnabledWithFlag,
              new: newPlan?.canEnabledWithFlag,
            };
          }
          if (oldPlan?.canEnabledInTrial !== newPlan?.canEnabledInTrial) {
            subChanges.canEnabledInTrial = {
              old: oldPlan?.canEnabledInTrial,
              new: newPlan?.canEnabledInTrial,
            };
          }
          if (oldPlan?.upsellPlanId !== newPlan?.upsellPlanId) {
            subChanges.upsellPlanId = {
              old: oldPlan?.upsellPlanId,
              new: newPlan?.upsellPlanId,
            };
          }
          if (oldPlan?.upsellAddonId !== newPlan?.upsellAddonId) {
            subChanges.upsellAddonId = {
              old: oldPlan?.upsellAddonId,
              new: newPlan?.upsellAddonId,
            };
          }

          if (Object.keys(subChanges).length > 0) {
            planChanges[plan.id] = {
              planId: plan.id,
              planName: plan.name,
              changes: subChanges,
            };
          }
        });

        changes[feature.name] = {
          status: "RENAMED",
          oldName: original.name,
          changes: planChanges,
        };
      } else {
        const planChanges: Record<string, any> = {};
        plans.forEach((plan) => {
          const oldPlan = original.plans[plan.id];
          const newPlan = feature.plans[plan.id];
          const subChanges: Record<string, { old: any; new: any }> = {};

          if (oldPlan?.canEnabled !== newPlan?.canEnabled) {
            subChanges.canEnabled = {
              old: oldPlan?.canEnabled,
              new: newPlan?.canEnabled,
            };
          }
          if (oldPlan?.canEnabledWithFlag !== newPlan?.canEnabledWithFlag) {
            subChanges.canEnabledWithFlag = {
              old: oldPlan?.canEnabledWithFlag,
              new: newPlan?.canEnabledWithFlag,
            };
          }
          if (oldPlan?.canEnabledInTrial !== newPlan?.canEnabledInTrial) {
            subChanges.canEnabledInTrial = {
              old: oldPlan?.canEnabledInTrial,
              new: newPlan?.canEnabledInTrial,
            };
          }
          if (oldPlan?.upsellPlanId !== newPlan?.upsellPlanId) {
            subChanges.upsellPlanId = {
              old: oldPlan?.upsellPlanId,
              new: newPlan?.upsellPlanId,
            };
          }
          if (oldPlan?.upsellAddonId !== newPlan?.upsellAddonId) {
            subChanges.upsellAddonId = {
              old: oldPlan?.upsellAddonId,
              new: newPlan?.upsellAddonId,
            };
          }

          if (Object.keys(subChanges).length > 0) {
            planChanges[plan.id] = {
              planId: plan.id,
              planName: plan.name,
              changes: subChanges,
            };
          }
        });

        if (Object.keys(planChanges).length > 0) {
          changes[feature.name] = {
            status: "MODIFIED",
            changes: planChanges,
          };
        }
      }
    });

    return changes;
  }, [features, originalFeatures]);

  return { changedFeatures };
};
