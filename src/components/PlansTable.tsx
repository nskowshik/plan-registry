import { useState, useRef, useMemo } from "react";
import {
  plans,
  features as initialFeatures,
  subColumns,
  createDefaultPlanValues,
  Feature,
} from "@/data/plansData";
import JSZip from "jszip";
import { AddFeatureDialog } from "./AddFeatureDialog";
import { AddPlanDialog } from "./AddPlanDialog";
import { ChangeLogsDialog } from "./PlansTable/components/ChangeLogsDialog";
import { Toolbar } from "./PlansTable/components/Toolbar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import html2canvas from "html2canvas";
import {
  exportFeaturesToJSON,
  exportSmartJSON,
} from "./PlansTable/utils/exportUtils";

const createEmptyFeature = (id: string): Feature => ({
  id,
  name: "",
  plans: createDefaultPlanValues(),
});

const PlansTable = () => {
  const [localPlans, setLocalPlans] = useState(plans);
  const [newlyAddedPlans, setNewlyAddedPlans] = useState<string[]>([]);
  const [features, setFeatures] = useState<Feature[]>(initialFeatures);
  const [originalFeatures] = useState<Feature[]>(initialFeatures);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [columnSearchQuery, setColumnSearchQuery] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showChangeLogsDialog, setShowChangeLogsDialog] =
    useState<boolean>(false);
  const [showAddFeatureDialog, setShowAddFeatureDialog] =
    useState<boolean>(false);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportAllPlans, setExportAllPlans] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    localPlans.reduce((acc, plan) => {
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

  const visiblePlans = localPlans.filter((plan) => visibleColumns[plan.id]);

  const filteredPlansForConfig = localPlans.filter((plan) =>
    plan.name.toLowerCase().includes(columnSearchQuery.toLowerCase()),
  );

  const toggleColumn = (planId: string) => {
    setVisibleColumns((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  const toggleAllColumns = () => {
    const allVisible = localPlans.every((plan) => visibleColumns[plan.id]);
    setVisibleColumns(
      localPlans.reduce(
        (acc, plan) => ({ ...acc, [plan.id]: !allVisible }),
        {},
      ),
    );
  };

  const handleAddRow = () => {
    setShowAddFeatureDialog(true);
  };

  const handleAddPlan = () => {
    setShowAddPlanDialog(true);
  };

  const handleCreatePlan = (
    planId: string,
    planName: string,
    isPopular: boolean,
    isActive: boolean,
    cloneFromPlanId?: string,
  ) => {
    // Create new plan object
    const newPlan = {
      id: planId,
      name: planName,
      isPopular,
      isActive,
    };

    // Add to local plans array
    setLocalPlans([...localPlans, newPlan]);

    // Track as newly added plan
    setNewlyAddedPlans([...newlyAddedPlans, planId]);

    // Add to visible columns (show by default if active)
    setVisibleColumns((prev) => ({
      ...prev,
      [planId]: isActive,
    }));

    // Update all features to include the new plan
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) => {
        // If cloning from an existing plan, copy its values
        if (cloneFromPlanId && feature.plans[cloneFromPlanId]) {
          return {
            ...feature,
            plans: {
              ...feature.plans,
              [planId]: { ...feature.plans[cloneFromPlanId] },
            },
          };
        }

        // Otherwise, use default empty values
        return {
          ...feature,
          plans: {
            ...feature.plans,
            [planId]: {
              canEnabled: false,
              canEnabledWithFlag: false,
              canEnabledInTrial: false,
              upsellPlanId: null,
              upsellAddonId: null,
            },
          },
        };
      }),
    );

    // Scroll to the new plan column after DOM updates
    setTimeout(() => {
      const planHeader = document.querySelector(`[data-plan-id="${planId}"]`);
      if (planHeader) {
        planHeader.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 100);
  };

  const handleCreateFeature = (newFeature: Feature) => {
    setFeatures([...features, newFeature]);

    // Scroll to the new feature row after DOM updates
    setTimeout(() => {
      const featureRow = document.querySelector(
        `[data-feature-id="${newFeature.id}"]`,
      );
      if (featureRow) {
        featureRow.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleExport = async () => {
    // Check if there are any new features
    const hasNewFeatures = Object.values(changedFeatures).some(
      (change) => change.status === "NEW",
    );

    // If there are new features, show dialog to choose export option
    if (hasNewFeatures) {
      setShowExportDialog(true);
    } else {
      // Otherwise, export directly with visible plans
      await exportSmartJSON(
        features,
        visiblePlans,
        changedFeatures,
        newlyAddedPlans,
        localPlans,
        false,
      );
    }
  };

  const handleConfirmExport = async () => {
    setShowExportDialog(false);
    await exportSmartJSON(
      features,
      visiblePlans,
      changedFeatures,
      newlyAddedPlans,
      localPlans,
      exportAllPlans,
    );
    setExportAllPlans(false); // Reset checkbox
  };

  const handleImport = async (files: FileList) => {
    try {
      const importedPlansData: Record<string, any> = {};

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.name.endsWith(".zip")) {
          // Handle zip file
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);

          // Extract all JSON files from zip
          for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
            if (filename.endsWith(".json") && !zipEntry.dir) {
              const content = await zipEntry.async("string");
              const planId = filename.replace(".json", "");
              importedPlansData[planId] = JSON.parse(content);
            }
          }
        } else if (file.name.endsWith(".json")) {
          // Handle individual JSON file
          const content = await file.text();
          const planId = file.name.replace(".json", "");
          importedPlansData[planId] = JSON.parse(content);
        }
      }

      // Create plans array from imported data
      const importedPlans = Object.keys(importedPlansData).map((planId) => {
        // Format plan name from ID (e.g., "starter" -> "Starter", "premium-2024" -> "Premium 2024")
        const planName = planId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          id: planId,
          name: planName,
          isPopular: false,
          isActive: true,
        };
      });

      // Process imported data and rebuild features
      const allFeatureKeys = new Set<string>();
      Object.values(importedPlansData).forEach((planData) => {
        Object.keys(planData).forEach((key) => allFeatureKeys.add(key));
      });

      // Create new features array
      const newFeatures: Feature[] = Array.from(allFeatureKeys).map(
        (featureKey) => {
          const featureName = featureKey
            .split("_")
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ");

          const plans: Record<string, any> = {};
          Object.entries(importedPlansData).forEach(([planId, planData]) => {
            plans[planId] = planData[featureKey] || {
              canEnabled: false,
              canEnabledWithFlag: false,
              canEnabledInTrial: false,
              upsellPlanId: null,
              upsellAddonId: null,
            };
          });

          return {
            id: featureKey.toLowerCase(),
            name: featureName,
            plans,
          };
        },
      );

      // Update plans state
      setLocalPlans(importedPlans);

      // Update visible columns to show all imported plans
      const newVisibleColumns: Record<string, boolean> = {};
      importedPlans.forEach((plan) => {
        newVisibleColumns[plan.id] = true;
      });
      setVisibleColumns(newVisibleColumns);

      // Update features state
      setFeatures(newFeatures);

      // Reset newly added plans since we're importing fresh data
      setNewlyAddedPlans([]);

      alert(
        `Successfully imported ${Object.keys(importedPlansData).length} plan(s) with ${newFeatures.length} feature(s)`,
      );
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import files. Please ensure they are valid JSON files.");
    }
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

  const handleRevertFeature = (featureName: string) => {
    // Find the original feature by name
    const originalFeature = originalFeatures.find((f) => f.name === featureName);
    
    if (originalFeature) {
      // Revert to original feature
      setFeatures((prevFeatures) =>
        prevFeatures.map((f) =>
          f.name === featureName ? { ...originalFeature } : f
        )
      );
    } else {
      // If it's a new feature, remove it
      setFeatures((prevFeatures) =>
        prevFeatures.filter((f) => f.name !== featureName)
      );
    }
  };

  const handleRevertPlan = (planId: string) => {
    // Remove the plan from localPlans
    setLocalPlans((prevPlans) => prevPlans.filter((p) => p.id !== planId));
    
    // Remove from newly added plans
    setNewlyAddedPlans((prevNewPlans) =>
      prevNewPlans.filter((id) => id !== planId)
    );
    
    // Remove from visible columns
    setVisibleColumns((prevColumns) => {
      const newColumns = { ...prevColumns };
      delete newColumns[planId];
      return newColumns;
    });
    
    // Remove plan data from all features
    setFeatures((prevFeatures) =>
      prevFeatures.map((feature) => {
        const newPlans = { ...feature.plans };
        delete newPlans[planId];
        return { ...feature, plans: newPlans };
      })
    );
  };

  return (
    <div className="w-full space-y-4">
      <Toolbar
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        plans={localPlans}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        onToggleAllColumns={toggleAllColumns}
        columnSearchQuery={columnSearchQuery}
        onColumnSearchChange={setColumnSearchQuery}
        onAddFeature={handleAddRow}
        onAddPlan={handleAddPlan}
        onExport={handleExport}
        onImport={handleImport}
        onChangeLogs={changeLogs}
        changedFeaturesCount={
          Object.keys(changedFeatures).length + newlyAddedPlans.length
        }
      />
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
                    data-plan-id={plan.id}
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
                  data-feature-id={feature.id}
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
        plans={localPlans}
        onCreateFeature={handleCreateFeature}
      />

      {/* Change Logs Dialog */}
      <ChangeLogsDialog
        open={showChangeLogsDialog}
        onOpenChange={setShowChangeLogsDialog}
        changedFeatures={changedFeatures}
        newlyAddedPlans={newlyAddedPlans}
        allPlans={localPlans}
        features={features}
        onRevertFeature={handleRevertFeature}
        onRevertPlan={handleRevertPlan}
      />

      {/* Add Plan Dialog */}
      <AddPlanDialog
        open={showAddPlanDialog}
        onOpenChange={setShowAddPlanDialog}
        onCreatePlan={handleCreatePlan}
      />

      {/* Export Options Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
            <DialogDescription>
              New features detected. Choose which plans to export.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="export-all-plans"
                checked={exportAllPlans}
                onCheckedChange={(checked) =>
                  setExportAllPlans(checked as boolean)
                }
              />
              <Label
                htmlFor="export-all-plans"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Export all plans (including hidden plans)
              </Label>
            </div>

            <p className="text-sm text-muted-foreground">
              {exportAllPlans
                ? `All ${localPlans.length} plans will be exported`
                : `Only ${visiblePlans.length} visible plans will be exported`}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowExportDialog(false);
                setExportAllPlans(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmExport}>Export JSON</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansTable;
