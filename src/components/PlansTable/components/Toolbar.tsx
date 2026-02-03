import { Plan } from "@/data/plansData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Download,
  Search,
  Edit,
  Eye,
  Settings2,
  Columns,
} from "lucide-react";

interface ToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  plans: Plan[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (planId: string) => void;
  onToggleAllColumns: () => void;
  columnSearchQuery: string;
  onColumnSearchChange: (query: string) => void;
  onAddFeature: () => void;
  onAddPlan: () => void;
  onExport: () => void;
  onChangeLogs: () => void;
  changedFeaturesCount: number;
}

export const Toolbar = ({
  isEditMode,
  onToggleEditMode,
  plans,
  visibleColumns,
  onToggleColumn,
  onToggleAllColumns,
  columnSearchQuery,
  onColumnSearchChange,
  onAddFeature,
  onAddPlan,
  onExport,
  onChangeLogs,
  changedFeaturesCount,
}: ToolbarProps) => {
  const filteredPlansForConfig = plans.filter((plan) =>
    plan.name.toLowerCase().includes(columnSearchQuery.toLowerCase()),
  );

  return (
    <div className="flex gap-2">
      <Button
        onClick={onToggleEditMode}
        variant={isEditMode ? "default" : "outline"}
        className="hover:bg-primary/90 transition-colors"
      >
        {isEditMode ? (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Read Mode
          </>
        ) : (
          <>
            <Edit className="h-4 w-4 mr-2" />
            Edit Mode
          </>
        )}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="transition-colors">
            <Settings2 className="h-4 w-4 mr-2" />
            Configure Columns
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Visible Columns</h4>
              <p className="text-xs text-muted-foreground">
                Select which plan columns to display
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search plans..."
                value={columnSearchQuery}
                onChange={(e) => onColumnSearchChange(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="toggle-all"
                checked={plans.every((plan) => visibleColumns[plan.id])}
                onCheckedChange={onToggleAllColumns}
              />
              <label
                htmlFor="toggle-all"
                className="text-sm font-medium cursor-pointer"
              >
                Toggle All
              </label>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredPlansForConfig.map((plan) => (
                <div key={plan.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={plan.id}
                    checked={visibleColumns[plan.id]}
                    onCheckedChange={() => onToggleColumn(plan.id)}
                  />
                  <label
                    htmlFor={plan.id}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {plan.name}
                    {plan.isPopular && (
                      <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                        ✔
                      </Badge>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {isEditMode && (
        <Button
          onClick={onAddFeature}
          variant="outline"
          className="hover:bg-primary transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feature Row
        </Button>
      )}
      {isEditMode && (
        <Button
          onClick={onAddPlan}
          variant="outline"
          className="hover:bg-primary transition-colors"
        >
          <Columns className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                onClick={onExport}
                variant="outline"
                className="transition-colors"
                disabled={changedFeaturesCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </span>
          </TooltipTrigger>
          {changedFeaturesCount === 0 && (
            <TooltipContent>
              <p>No changes to export</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <Button
        onClick={onChangeLogs}
        variant="outline"
        className="transition-colors"
      >
        ✍️ Change log
      </Button>
    </div>
  );
};
