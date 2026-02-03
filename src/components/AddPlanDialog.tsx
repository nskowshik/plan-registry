import { useState } from "react";
import { plans as existingPlans } from "@/data/plansData";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

interface AddPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePlan: (planId: string, planName: string, isPopular: boolean, isActive: boolean, cloneFromPlanId?: string) => void;
}

export const AddPlanDialog = ({
  open,
  onOpenChange,
  onCreatePlan,
}: AddPlanDialogProps) => {
  const [planId, setPlanId] = useState<string>("");
  const [planName, setPlanName] = useState<string>("");
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [cloneFromPlanId, setCloneFromPlanId] = useState<string>("");

  const handleCreate = () => {
    if (!planId.trim() || !planName.trim()) return;

    onCreatePlan(planId.trim(), planName.trim(), isPopular, isActive, cloneFromPlanId || undefined);
    handleClose();
  };

  const handleClose = () => {
    setPlanId("");
    setPlanName("");
    setIsPopular(false);
    setIsActive(true);
    setCloneFromPlanId("");
    onOpenChange(false);
  };

  const handleCloneSelect = (selectedPlanId: string) => {
    setCloneFromPlanId(selectedPlanId);
    if (selectedPlanId) {
      const sourcePlan = existingPlans.find((p) => p.id === selectedPlanId);
      if (sourcePlan) {
        setIsPopular(sourcePlan.isPopular || false);
        setIsActive(sourcePlan.isActive || false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>Add New Plan</DialogTitle>
          <DialogDescription>
            Create a new plan or clone from an existing one
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-id">Plan ID (File name)*</Label>
              <Input
                id="plan-id"
                placeholder="e.g., premium-2024"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for the plan (lowercase with hyphens)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                placeholder="e.g., Premium 2024"
                value={planId.replace(/[^a-zA-Z0-9]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                disabled
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clone-from">Clone From Existing Plan (Optional)</Label>
              <select
                id="clone-from"
                value={cloneFromPlanId}
                onChange={(e) => handleCloneSelect(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">-- Select a plan to clone --</option>
                {existingPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Clone settings from an existing plan
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <label
                  htmlFor="is-active"
                  className="text-sm font-medium cursor-pointer"
                >
                  Active Plan
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-popular"
                  checked={isPopular}
                  onCheckedChange={(checked) => setIsPopular(checked as boolean)}
                />
                <label
                  htmlFor="is-popular"
                  className="text-sm font-medium cursor-pointer"
                >
                  Popular Plan
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!planId.trim() || !planName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
