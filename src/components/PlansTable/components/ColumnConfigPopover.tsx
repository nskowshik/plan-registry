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
import { Plan } from "../types";

interface ColumnConfigPopoverProps {
  plans: Plan[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (planId: string) => void;
  onToggleAll: () => void;
}

export const ColumnConfigPopover = ({
  plans,
  visibleColumns,
  onToggleColumn,
  onToggleAll,
}: ColumnConfigPopoverProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allVisible = Object.values(visibleColumns).every((v) => v);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Configure Columns
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
          <div
            className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer mb-2 border-b"
            onClick={onToggleAll}
          >
            <Checkbox checked={allVisible} onCheckedChange={() => {}} />
            <span className="text-sm font-medium">
              {allVisible ? "Deselect All" : "Select All"}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                onClick={() => onToggleColumn(plan.id)}
              >
                <Checkbox
                  checked={visibleColumns[plan.id]}
                  onCheckedChange={() => {}}
                />
                <span className="text-sm">{plan.name}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
