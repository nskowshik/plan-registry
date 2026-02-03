import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChangedFeature } from "../types";
import { Plan, Feature } from "@/data/plansData";

interface ChangeLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changedFeatures: Record<string, ChangedFeature>;
  newlyAddedPlans: string[];
  allPlans: Plan[];
  features: Feature[];
}

export const ChangeLogsDialog = ({
  open,
  onOpenChange,
  changedFeatures,
  newlyAddedPlans,
  allPlans,
  features,
}: ChangeLogsDialogProps) => {
  const changeLogsContentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Change Logs</DialogTitle>
          <DialogDescription>
            {Object.keys(changedFeatures).length === 0 &&
            newlyAddedPlans.length === 0
              ? "No changes detected"
              : `${Object.keys(changedFeatures).length} feature(s) modified, ${newlyAddedPlans.length} plan(s) added`}
          </DialogDescription>
        </DialogHeader>
        <div
          ref={changeLogsContentRef}
          className="flex-1 overflow-auto p-4 space-y-4"
        >
          {Object.keys(changedFeatures).length === 0 &&
          newlyAddedPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No changes have been made.
            </div>
          ) : (
            <>
              {newlyAddedPlans.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Newly Added Plans
                  </h3>
                  {newlyAddedPlans.map((planId) => {
                    const plan = allPlans.find((p) => p.id === planId);
                    if (!plan) return null;
                    
                    // Get features for this plan
                    const enabledFeatures = features.filter(
                      (f) => f.plans[planId]?.canEnabled
                    );
                    const trialFeatures = features.filter(
                      (f) => f.plans[planId]?.canEnabledInTrial
                    );
                    const flagFeatures = features.filter(
                      (f) => f.plans[planId]?.canEnabledWithFlag
                    );
                    
                    return (
                      <div
                        key={planId}
                        className="border rounded-lg p-4 bg-card"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          <Badge variant="default">NEW PLAN</Badge>
                          {plan.isPopular && (
                            <Badge variant="secondary">Popular</Badge>
                          )}
                          {plan.isActive && (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Plan ID: <span className="font-mono">{planId}</span>
                        </div>
                        
                        {/* Features List */}
                        <div className="space-y-3 mt-4">
                          {enabledFeatures.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-muted-foreground">
                                Enabled ({enabledFeatures.length})
                              </h5>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {enabledFeatures.map((feature) => (
                                  <span
                                    key={feature.id}
                                    className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm"
                                  >
                                    {feature.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {trialFeatures.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-muted-foreground">
                                In Trial ({trialFeatures.length})
                              </h5>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {trialFeatures.map((feature) => (
                                  <span
                                    key={feature.id}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                                  >
                                    {feature.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {flagFeatures.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2 text-muted-foreground">
                                With Flag ({flagFeatures.length})
                              </h5>
                              <div className="flex flex-wrap gap-2 pl-4">
                                {flagFeatures.map((feature) => (
                                  <span
                                    key={feature.id}
                                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm"
                                  >
                                    {feature.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {enabledFeatures.length === 0 && trialFeatures.length === 0 && flagFeatures.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                              No features configured for this plan yet.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Modified Features Section */}
              {Object.keys(changedFeatures).length > 0 && (
                <div className="space-y-4">
                  {newlyAddedPlans.length > 0 && (
                    <h3 className="font-semibold text-lg border-b pb-2">
                      Modified Features
                    </h3>
                  )}
                  {Object.entries(changedFeatures).map(
                    ([featureName, featureData]) => (
                      <div
                        key={featureName}
                        className="border rounded-lg p-4 bg-card"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg">
                            {featureName}
                          </h3>
                          <Badge
                            variant={
                              featureData.status === "NEW"
                                ? "default"
                                : featureData.status === "RENAMED"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {featureData.status}
                          </Badge>
                        </div>

                        {featureData.status === "RENAMED" && (
                          <div className="mb-3 text-sm">
                            <span className="text-muted-foreground">
                              Old name:{" "}
                            </span>
                            <span className="line-through text-red-600 dark:text-red-400">
                              {featureData.oldName}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {featureName}
                            </span>
                          </div>
                        )}

                        {featureData.status === "NEW" &&
                          featureData.planData && (
                            <div className="space-y-3">
                              {/* Can Enabled */}
                              {Object.values(featureData.planData).some(
                                (p) => p.data.canEnabled,
                              ) && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                    Enabled
                                  </h4>
                                  <div className="flex flex-wrap gap-2 pl-4">
                                    {Object.entries(featureData.planData)
                                      .filter(
                                        ([_, planInfo]) =>
                                          planInfo.data.canEnabled,
                                      )
                                      .map(([planId, planInfo]) => (
                                        <span
                                          key={planId}
                                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm"
                                        >
                                          {planInfo.planName}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Can Enabled In Trial */}
                              {Object.values(featureData.planData).some(
                                (p) => p.data.canEnabledInTrial,
                              ) && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                    In Trial
                                  </h4>
                                  <div className="flex flex-wrap gap-2 pl-4">
                                    {Object.entries(featureData.planData)
                                      .filter(
                                        ([_, planInfo]) =>
                                          planInfo.data.canEnabledInTrial,
                                      )
                                      .map(([planId, planInfo]) => (
                                        <span
                                          key={planId}
                                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                                        >
                                          {planInfo.planName}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Can Enabled With Flag */}
                              {Object.values(featureData.planData).some(
                                (p) => p.data.canEnabledWithFlag,
                              ) && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                    With Flag
                                  </h4>
                                  <div className="flex flex-wrap gap-2 pl-4">
                                    {Object.entries(featureData.planData)
                                      .filter(
                                        ([_, planInfo]) =>
                                          planInfo.data.canEnabledWithFlag,
                                      )
                                      .map(([planId, planInfo]) => (
                                        <span
                                          key={planId}
                                          className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm"
                                        >
                                          {planInfo.planName}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Upsell Plan */}
                              {Object.values(featureData.planData).some(
                                (p) => p.data.upsellPlanId,
                              ) && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                    Upsell Plan
                                  </h4>
                                  <div className="space-y-1 pl-4">
                                    {Object.entries(featureData.planData)
                                      .filter(
                                        ([_, planInfo]) =>
                                          planInfo.data.upsellPlanId,
                                      )
                                      .map(([planId, planInfo]) => (
                                        <div key={planId} className="text-sm">
                                          <span className="font-medium">
                                            {planInfo.planName}:
                                          </span>{" "}
                                          <span className="text-orange-600 dark:text-orange-400">
                                            {planInfo.data.upsellPlanId}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Upsell Addon */}
                              {Object.values(featureData.planData).some(
                                (p) => p.data.upsellAddonId,
                              ) && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                                    Upsell Addon
                                  </h4>
                                  <div className="space-y-1 pl-4">
                                    {Object.entries(featureData.planData)
                                      .filter(
                                        ([_, planInfo]) =>
                                          planInfo.data.upsellAddonId,
                                      )
                                      .map(([planId, planInfo]) => (
                                        <div key={planId} className="text-sm">
                                          <span className="font-medium">
                                            {planInfo.planName}:
                                          </span>{" "}
                                          <span className="text-orange-600 dark:text-orange-400">
                                            {planInfo.data.upsellAddonId}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                        {featureData.status === "MODIFIED" &&
                          featureData.changes &&
                          Object.entries(featureData.changes).map(
                            ([planId, planChange]) => (
                              <div key={planId} className="mb-4 last:mb-0">
                                <h4 className="font-medium text-sm mb-2">
                                  {planChange.planName}
                                </h4>
                                <div className="space-y-2 pl-4">
                                  {Object.entries(planChange.changes).map(
                                    ([key, change]) => (
                                      <div
                                        key={key}
                                        className="text-sm flex items-center gap-2"
                                      >
                                        <span className="text-muted-foreground min-w-[180px]">
                                          {key}:
                                        </span>
                                        <span className="line-through text-red-600 dark:text-red-400">
                                          {String(change.old ?? "null")}
                                        </span>
                                        <span>→</span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                          {String(change.new ?? "null")}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}

                        {featureData.status === "RENAMED" &&
                          featureData.changes &&
                          Object.entries(featureData.changes).map(
                            ([planId, planChange]) => (
                              <div key={planId} className="mb-4 last:mb-0">
                                <h4 className="font-medium text-sm mb-2">
                                  {planChange.planName}
                                </h4>
                                <div className="space-y-2 pl-4">
                                  {Object.entries(planChange.changes).map(
                                    ([key, change]) => (
                                      <div
                                        key={key}
                                        className="text-sm flex items-center gap-2"
                                      >
                                        <span className="text-muted-foreground min-w-[180px]">
                                          {key}:
                                        </span>
                                        <span className="line-through text-red-600 dark:text-red-400">
                                          {String(change.old ?? "null")}
                                        </span>
                                        <span>→</span>
                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                          {String(change.new ?? "null")}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
