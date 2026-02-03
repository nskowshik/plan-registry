import { useState, useRef, useMemo } from "react";
import {
  plans,
  features as initialFeatures,
  subColumns,
  createDefaultPlanValues,
  Feature,
} from "@/data/plansData";
import { AddFeatureDialog } from "./AddFeatureDialog";
import { ChangeLogsDialog } from "./PlansTable/components/ChangeLogsDialog";
import { useChangeTracking } from "./PlansTable/hooks/useChangeTracking";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  Plus,
  Download,
  Share,
  Search,
  Edit,
  Eye,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import html2canvas from "html2canvas";
import { exportFeaturesToJSON } from "./PlansTable/utils/exportUtils";

const createEmptyFeature = (id: string): Feature => ({
  id,
  name: "",
  plans: createDefaultPlanValues(),
});

const PlansTable = () => {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [originalFeatures] = useState<Feature[]>(initialFeatures);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [columnSearchQuery, setColumnSearchQuery] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [showChangeLogsDialog, setShowChangeLogsDialog] =
    useState<boolean>(false);
  const [showAddFeatureDialog, setShowAddFeatureDialog] =
    useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    plans.reduce((acc, plan) => {
      const isNFR =
        plan.name.toLowerCase().includes("nfr") ||
        plan.id.toLowerCase().includes("not-for-resale");
      const shouldShow = plan.isActive || isNFR;
      return { ...acc, [plan.id]: shouldShow };
    }, {}),
  );
  const tableRef = useRef<HTMLTableElement>(null);

  // Use change tracking hook
  const { changedFeatures } = useChangeTracking(features, originalFeatures);

  const visiblePlans = plans.filter((plan) => visibleColumns[plan.id]);

  const filteredPlansForConfig = plans.filter((plan) =>
    plan.name.toLowerCase().includes(columnSearchQuery.toLowerCase()),
  );

  const toggleColumn = (planId: string) => {
    setVisibleColumns((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  const toggleAllColumns = () => {
    const allVisible = plans.every((plan) => visibleColumns[plan.id]);
    setVisibleColumns(
      plans.reduce((acc, plan) => ({ ...acc, [plan.id]: !allVisible }), {}),
    );
  };

  const handleAddRow = () => {
    setShowAddFeatureDialog(true);
  };

  const handleCreateFeature = (newFeature: Feature) => {
    setFeatures([...features, newFeature]);
  };

  const handleExport = async () => {
    await exportFeaturesToJSON(features, visiblePlans);
  };

  const handleFeatureNameChange = (featureId: string, name: string) => {
    setFeatures(features.map((f) => (f.id === featureId ? { ...f, name } : f)));
  };

  const toggleCheckbox = (
    featureId: string,
    planId: string,
    subColId: string,
  ) => {
    setFeatures(
      features.map((f) => {
        if (f.id !== featureId) return f;
        return {
          ...f,
          plans: {
            ...f.plans,
            [planId]: {
              ...f.plans[planId],
              [subColId]: !f.plans[planId][subColId],
            },
          },
        };
      }),
    );
  };

  const filteredFeatures = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const changeLogs = () => {
    setShowChangeLogsDialog(true);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={() => setIsEditMode(!isEditMode)}
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
            <Button
              variant="outline"
              className="transition-colors"
            >
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
                  onChange={(e) => setColumnSearchQuery(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="toggle-all"
                  checked={plans.every((plan) => visibleColumns[plan.id])}
                  onCheckedChange={toggleAllColumns}
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
                      onCheckedChange={() => toggleColumn(plan.id)}
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
            onClick={handleAddRow}
            variant="outline"
            className="hover:bg-primary transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature Row
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="transition-colors"
                  disabled={Object.keys(changedFeatures).length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </span>
            </TooltipTrigger>
            {Object.keys(changedFeatures).length === 0 && (
              <TooltipContent>
                <p>No changes to export</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Button
          onClick={changeLogs}
          variant="outline"
          className="transition-colors"
        >
          ✍️ Change log
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          <Table ref={tableRef} className="relative">
            <TableHeader className="sticky top-0 z-30 bg-card">
              {/* Plan names row */}
              <TableRow className="table-header-bg hover:bg-transparent border-b-0">
                <TableHead
                  rowSpan={2}
                  className="w-[200px] min-w-[200px] py-2 pl-6 align-middle border-r border-border sticky left-0 top-0 z-40 bg-card table-header-bg"
                >
                  <div className="space-y-2">
                    <span className="text-lg font-semibold text-foreground">
                      Features
                    </span>
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-7 text-xs"
                      />
                    </div>
                  </div>
                </TableHead>
                {visiblePlans.map((plan) => (
                  <TableHead
                    key={plan.id}
                    colSpan={subColumns.length}
                    className={cn(
                      "text-center py-4 border-r border-border last:border-r-0 sticky top-0 bg-card table-header-bg",
                      plan.isPopular && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-foreground">
                        {plan.name}
                      </span>
                      {plan.isPopular && (
                        <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                          ✔
                        </Badge>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
              {/* Sub-column headers row */}
              <TableRow className="table-header-bg hover:bg-transparent">
                {visiblePlans.map((plan) =>
                  subColumns.map((subCol, subIndex) => (
                    <TableHead
                      key={`${plan.id}-${subCol.id}`}
                      className={cn(
                        "text-center py-2 px-3 text-xs font-medium text-muted-foreground min-w-[80px] bg-card table-header-bg",
                        plan.isPopular && "bg-primary/5",
                        subIndex === subColumns.length - 1 &&
                          "border-r border-border last:border-r-0",
                      )}
                    >
                      {subCol.name}
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeatures.map((feature) => (
                <TableRow
                  key={feature.id}
                  className="table-row-hover transition-colors duration-150"
                >
                  <TableCell className="py-3 pl-6 border-r border-border sticky left-0 z-10 bg-card">
                    {isEditMode ? (
                      editingName === feature.id ? (
                        <Input
                          autoFocus
                          value={feature.name}
                          onChange={(e) =>
                            handleFeatureNameChange(feature.id, e.target.value)
                          }
                          onBlur={() => setEditingName(null)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && setEditingName(null)
                          }
                          className="h-8 text-sm font-medium"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingName(feature.id)}
                          className="text-foreground font-medium hover:bg-muted/50 rounded px-2 py-1 cursor-text transition-colors text-left w-full"
                        >
                          {feature.name || (
                            <span className="text-muted-foreground italic">
                              Enter name...
                            </span>
                          )}
                        </button>
                      )
                    ) : (
                      <span className="text-foreground font-medium px-2 py-1">
                        {feature.name}
                      </span>
                    )}
                  </TableCell>
                  {visiblePlans.map((plan) =>
                    subColumns.map((subCol, subIndex) => (
                      <TableCell
                        key={`${feature.id}-${plan.id}-${subCol.id}`}
                        className={cn(
                          "py-3 px-3 text-center",
                          plan.isPopular && "bg-primary/5",
                          subIndex === subColumns.length - 1 &&
                            "border-r border-border last:border-r-0",
                        )}
                      >
                        {isEditMode ? (
                          <button
                            onClick={() =>
                              toggleCheckbox(feature.id, plan.id, subCol.id)
                            }
                            className="w-full flex justify-center cursor-pointer hover:opacity-70 transition-opacity"
                          >
                            {feature?.plans?.[plan?.id]?.[subCol?.id] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </button>
                        ) : (
                          <div className="w-full flex justify-center">
                            {feature?.plans?.[plan?.id]?.[subCol?.id] ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    )),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Feature Dialog */}
      <AddFeatureDialog
        open={showAddFeatureDialog}
        onOpenChange={setShowAddFeatureDialog}
        features={features}
        onCreateFeature={handleCreateFeature}
      />

      {/* Change Logs Dialog */}
      <ChangeLogsDialog
        open={showChangeLogsDialog}
        onOpenChange={setShowChangeLogsDialog}
        changedFeatures={changedFeatures}
      />
    </div>
  );
};

export default PlansTable;
