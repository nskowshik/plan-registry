import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
}

interface PlanMultiSelectProps {
  plans: Plan[];
  selectedPlans: Set<string>;
  onSelectionChange: (selectedPlans: Set<string>) => void;
  label: string;
  placeholder?: string;
}

export const PlanMultiSelect = ({
  plans,
  selectedPlans,
  onSelectionChange,
  label,
  placeholder = "Select plans...",
}: PlanMultiSelectProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlan = (planId: string) => {
    const newSet = new Set(selectedPlans);
    if (newSet.has(planId)) {
      newSet.delete(planId);
    } else {
      newSet.add(planId);
    }
    onSelectionChange(newSet);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedPlans.size === 0
                ? placeholder
                : `${selectedPlans.size} plan(s) selected`}
            </span>
            <Settings2 className="ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2">
            <Input
              placeholder="Search plans..."
              className="mb-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => togglePlan(plan.id)}
                >
                  <Checkbox
                    checked={selectedPlans.has(plan.id)}
                    onCheckedChange={() => {}}
                  />
                  <span className="text-sm">{plan.name}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
