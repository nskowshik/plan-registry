import { useState } from "react";
import { Plan, Feature } from "@/data/plansData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { PlanMultiSelect } from "./PlanMultiSelect";

interface AddFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features: Feature[];
  plans: Plan[];
  onCreateFeature: (feature: Feature) => void;
}

export const AddFeatureDialog = ({
  open,
  onOpenChange,
  features,
  plans,
  onCreateFeature,
}: AddFeatureDialogProps) => {
  const [newFeatureName, setNewFeatureName] = useState<string>("");
  const [newFeatureId,setNewFeatureId] = useState<string>("");
  const [copyFromFeatureId, setCopyFromFeatureId] = useState<string>("");
  const [canEnabledPlans, setCanEnabledPlans] = useState<Set<string>>(
    new Set(),
  );
  const [canEnabledWithFlagPlans, setCanEnabledWithFlagPlans] = useState<
    Set<string>
  >(new Set());
  const [canEnabledInTrialPlans, setCanEnabledInTrialPlans] = useState<
    Set<string>
  >(new Set());
  const [upsellPlanName, setUpsellPlanName] = useState<string>("");
  const [upsellPlanSelectedPlans, setUpsellPlanSelectedPlans] = useState<
    Set<string>
  >(new Set());
  const [upsellAddonName, setUpsellAddonName] = useState<string>("");
  const [upsellAddonSelectedPlans, setUpsellAddonSelectedPlans] = useState<
    Set<string>
  >(new Set());

  const handleCopyFromFeature = (featureId: string) => {
    setCopyFromFeatureId(featureId);
    if (!featureId) {
      setCanEnabledPlans(new Set());
      setCanEnabledWithFlagPlans(new Set());
      setCanEnabledInTrialPlans(new Set());
      setUpsellPlanName("");
      setUpsellPlanSelectedPlans(new Set());
      setUpsellAddonName("");
      setUpsellAddonSelectedPlans(new Set());
      return;
    }

    const sourceFeature = features.find((f) => f.id === featureId);
    if (!sourceFeature) return;

    const canEnabledSet = new Set<string>();
    const canEnabledWithFlagSet = new Set<string>();
    const canEnabledInTrialSet = new Set<string>();
    const upsellPlanPlansSet = new Set<string>();
    const upsellAddonPlansSet = new Set<string>();
    let upsellPlanIdValue = "";
    let upsellAddonIdValue = "";

    plans.forEach((plan) => {
      const planData = sourceFeature.plans[plan.id];
      if (planData?.canEnabled) {
        canEnabledSet.add(plan.id);
      }
      if (planData?.canEnabledWithFlag) {
        canEnabledWithFlagSet.add(plan.id);
      }
      if (planData?.canEnabledInTrial) {
        canEnabledInTrialSet.add(plan.id);
      }
      if (planData?.upsellPlanId) {
        upsellPlanIdValue = planData.upsellPlanId;
        upsellPlanPlansSet.add(plan.id);
      }
      if (planData?.upsellAddonId) {
        upsellAddonIdValue = planData.upsellAddonId;
        upsellAddonPlansSet.add(plan.id);
      }
    });

    setCanEnabledPlans(canEnabledSet);
    setCanEnabledWithFlagPlans(canEnabledWithFlagSet);
    setCanEnabledInTrialPlans(canEnabledInTrialSet);
    setUpsellPlanName(upsellPlanIdValue);
    setUpsellPlanSelectedPlans(upsellPlanPlansSet);
    setUpsellAddonName(upsellAddonIdValue);
    setUpsellAddonSelectedPlans(upsellAddonPlansSet);
  };

  const handleCreate = () => {
    if (!newFeatureName.trim()) return;

    const newId = `feature-${Date.now()}`;
    const newFeature: Feature = {
      id: newId,
      name: newFeatureName.trim(),
      plans: plans.reduce(
        (acc, plan) => {
          acc[plan.id] = {
            canEnabled: canEnabledPlans.has(plan.id),
            canEnabledWithFlag: canEnabledWithFlagPlans.has(plan.id),
            canEnabledInTrial: canEnabledInTrialPlans.has(plan.id),
            upsellPlanId: upsellPlanSelectedPlans.has(plan.id)
              ? upsellPlanName
              : null,
            upsellAddonId: upsellAddonSelectedPlans.has(plan.id)
              ? upsellAddonName
              : null,
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };

    onCreateFeature(newFeature);
    handleClose();
  };

  const handleClose = () => {
    setNewFeatureName("");
    setCopyFromFeatureId("");
    setCanEnabledPlans(new Set());
    setCanEnabledWithFlagPlans(new Set());
    setCanEnabledInTrialPlans(new Set());
    setUpsellPlanName("");
    setUpsellPlanSelectedPlans(new Set());
    setUpsellAddonName("");
    setUpsellAddonSelectedPlans(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Add New Feature</DialogTitle>
          <DialogDescription>
            Enter the feature details and set default values for all plans
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="feature-name" className="text-sm font-medium">
                Feature Name
              </label>
              <Input
                id="feature-name"
                placeholder="Enter feature name..."
                value={newFeatureName}
                onChange={(e) => {
                  setNewFeatureName(e.target.value);
                  setNewFeatureId(e.target.value.toUpperCase().replace(/\s+/g, "_"));
                }}
                className="w-full"
              />
              {newFeatureId.trim() && (
                <p className="text-xs text-muted-foreground">
                  Feature ID: <span className="font-mono font-semibold text-foreground">{newFeatureId}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="copy-from" className="text-sm font-medium">
                Copy From Existing Feature (Optional)
              </label>
              <select
                id="copy-from"
                value={copyFromFeatureId}
                onChange={(e) => handleCopyFromFeature(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">-- Select a feature to copy --</option>
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium block">
                Select Plans for Each Category
              </label>
              <div className="space-y-4 border rounded-lg p-4">
                <PlanMultiSelect
                  plans={plans}
                  selectedPlans={canEnabledPlans}
                  onSelectionChange={setCanEnabledPlans}
                  label="Can Enabled"
                />

                <PlanMultiSelect
                  plans={plans}
                  selectedPlans={canEnabledWithFlagPlans}
                  onSelectionChange={setCanEnabledWithFlagPlans}
                  label="Can Enabled With Flag"
                />

                <PlanMultiSelect
                  plans={plans}
                  selectedPlans={canEnabledInTrialPlans}
                  onSelectionChange={setCanEnabledInTrialPlans}
                  label="Can Enabled In Trial"
                />

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium mb-2 block">
                    Upsell Plan
                  </label>
                  <Input
                    placeholder="Enter upsell plan name..."
                    value={upsellPlanName}
                    onChange={(e) => setUpsellPlanName(e.target.value)}
                    className="mb-2"
                  />
                  <PlanMultiSelect
                    plans={plans}
                    selectedPlans={upsellPlanSelectedPlans}
                    onSelectionChange={setUpsellPlanSelectedPlans}
                    label="Select Plans for Upsell Plan"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium mb-2 block">
                    Upsell Addon
                  </label>
                  <Input
                    placeholder="Enter upsell addon name..."
                    value={upsellAddonName}
                    onChange={(e) => setUpsellAddonName(e.target.value)}
                    className="mb-2"
                  />
                  <PlanMultiSelect
                    plans={plans}
                    selectedPlans={upsellAddonSelectedPlans}
                    onSelectionChange={setUpsellAddonSelectedPlans}
                    label="Select Plans for Upsell Addon"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!newFeatureName.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
