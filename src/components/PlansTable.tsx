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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import JSZip from "jszip";

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
  const [newFeatureName, setNewFeatureName] = useState<string>("");
  const [copyFromFeatureId, setCopyFromFeatureId] = useState<string>("");
  // Per-plan selections for each category
  const [canEnabledPlans, setCanEnabledPlans] = useState<Set<string>>(new Set());
  const [canEnabledWithFlagPlans, setCanEnabledWithFlagPlans] = useState<Set<string>>(new Set());
  const [canEnabledInTrialPlans, setCanEnabledInTrialPlans] = useState<Set<string>>(new Set());
  // Upsell fields: name (text) + selected plans (Set)
  const [upsellPlanName, setUpsellPlanName] = useState<string>("");
  const [upsellPlanSelectedPlans, setUpsellPlanSelectedPlans] = useState<Set<string>>(new Set());
  const [upsellAddonName, setUpsellAddonName] = useState<string>("");
  const [upsellAddonSelectedPlans, setUpsellAddonSelectedPlans] = useState<Set<string>>(new Set());
  // Search states for dropdowns
  const [canEnabledSearch, setCanEnabledSearch] = useState<string>("");
  const [canEnabledWithFlagSearch, setCanEnabledWithFlagSearch] = useState<string>("");
  const [canEnabledInTrialSearch, setCanEnabledInTrialSearch] = useState<string>("");
  const [upsellPlanSearch, setUpsellPlanSearch] = useState<string>("");
  const [upsellAddonSearch, setUpsellAddonSearch] = useState<string>("");
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

  const handleCopyFromFeature = (featureId: string) => {
    setCopyFromFeatureId(featureId);
    if (!featureId) {
      // Reset all selections
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

    // Populate Sets based on which plans have each property enabled
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

  const handleCreateFeature = () => {
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
            upsellPlanId: upsellPlanSelectedPlans.has(plan.id) ? upsellPlanName : null,
            upsellAddonId: upsellAddonSelectedPlans.has(plan.id) ? upsellAddonName : null,
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };

    setFeatures([...features, newFeature]);
    setShowAddFeatureDialog(false);
    setNewFeatureName("");
    setCopyFromFeatureId("");
    setCanEnabledPlans(new Set());
    setCanEnabledWithFlagPlans(new Set());
    setCanEnabledInTrialPlans(new Set());
    setUpsellPlanName("");
    setUpsellPlanSelectedPlans(new Set());
    setUpsellAddonName("");
    setUpsellAddonSelectedPlans(new Set());
  };

  const handleExport = async () => {
    const zip = new JSZip();

    // Convert features array back to original JSON format for each plan
    visiblePlans.forEach((plan) => {
      const planData: Record<string, any> = {};

      features.forEach((feature) => {
        // Use the original feature name (before formatting) as the key
        // We'll use the feature.name as is since it's already formatted
        const featureKey = feature.name.toUpperCase().replace(/\s+/g, "_");

        // Get all plan data for this feature, including all properties
        planData[featureKey] = feature.plans[plan.id] || {};
      });

      // Add JSON file to zip
      zip.file(`${plan.id}.json`, JSON.stringify(planData, null, 2));
    });

    // Generate zip file and trigger download
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gating-json-${new Date().toString()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
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
              className="hover:bg-primary/5 transition-colors"
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
        <Button
          onClick={handleExport}
          variant="outline"
          className="hover:bg-primary/5 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
        <Button
          onClick={changeLogs}
          variant="outline"
          className="hover:bg-primary/5 transition-colors"
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

      {/* Action Buttons */}
      {isEditMode && (
        <div className="flex gap-2">
          <Button
            onClick={handleAddRow}
            variant="outline"
            className="flex-1 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature Row
          </Button>
        </div>
      )}

      {/* Add Feature Dialog */}
      <Dialog
        open={showAddFeatureDialog}
        onOpenChange={setShowAddFeatureDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>
              Enter the feature details and set default values for all plans
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="feature-name" className="text-sm font-medium">
                Feature Name
              </label>
              <Input
                id="feature-name"
                placeholder="Enter feature name..."
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                className="w-full"
              />
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
              <label className="text-sm font-medium block mb-2">
                Select Plans for Each Category
              </label>
              <div className="space-y-4 border rounded-lg p-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Can Enabled</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {canEnabledPlans.size === 0
                            ? "Select plans..."
                            : `${canEnabledPlans.size} plan(s) selected`}
                        </span>
                        <Settings2 className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-2">
                        <Input
                          placeholder="Search plans..."
                          className="mb-2"
                          value={canEnabledSearch}
                          onChange={(e) => setCanEnabledSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {plans
                            .filter((plan) =>
                              plan.name.toLowerCase().includes(canEnabledSearch.toLowerCase())
                            )
                            .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                const newSet = new Set(canEnabledPlans);
                                if (newSet.has(plan.id)) {
                                  newSet.delete(plan.id);
                                } else {
                                  newSet.add(plan.id);
                                }
                                setCanEnabledPlans(newSet);
                              }}
                            >
                              <Checkbox
                                checked={canEnabledPlans.has(plan.id)}
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Can Enabled With Flag</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {canEnabledWithFlagPlans.size === 0
                            ? "Select plans..."
                            : `${canEnabledWithFlagPlans.size} plan(s) selected`}
                        </span>
                        <Settings2 className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-2">
                        <Input
                          placeholder="Search plans..."
                          className="mb-2"
                          value={canEnabledWithFlagSearch}
                          onChange={(e) => setCanEnabledWithFlagSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {plans
                            .filter((plan) =>
                              plan.name.toLowerCase().includes(canEnabledWithFlagSearch.toLowerCase())
                            )
                            .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                const newSet = new Set(canEnabledWithFlagPlans);
                                if (newSet.has(plan.id)) {
                                  newSet.delete(plan.id);
                                } else {
                                  newSet.add(plan.id);
                                }
                                setCanEnabledWithFlagPlans(newSet);
                              }}
                            >
                              <Checkbox
                                checked={canEnabledWithFlagPlans.has(plan.id)}
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Can Enabled In Trial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {canEnabledInTrialPlans.size === 0
                            ? "Select plans..."
                            : `${canEnabledInTrialPlans.size} plan(s) selected`}
                        </span>
                        <Settings2 className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-2">
                        <Input
                          placeholder="Search plans..."
                          className="mb-2"
                          value={canEnabledInTrialSearch}
                          onChange={(e) => setCanEnabledInTrialSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {plans
                            .filter((plan) =>
                              plan.name.toLowerCase().includes(canEnabledInTrialSearch.toLowerCase())
                            )
                            .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                const newSet = new Set(canEnabledInTrialPlans);
                                if (newSet.has(plan.id)) {
                                  newSet.delete(plan.id);
                                } else {
                                  newSet.add(plan.id);
                                }
                                setCanEnabledInTrialPlans(newSet);
                              }}
                            >
                              <Checkbox
                                checked={canEnabledInTrialPlans.has(plan.id)}
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

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium mb-2 block">Upsell Plan</label>
                  <Input
                    placeholder="Enter upsell plan name..."
                    value={upsellPlanName}
                    onChange={(e) => setUpsellPlanName(e.target.value)}
                    className="mb-2"
                  />
                  <label className="text-sm font-medium mb-2 block">Select Plans for Upsell Plan</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {upsellPlanSelectedPlans.size === 0
                            ? "Select plans..."
                            : `${upsellPlanSelectedPlans.size} plan(s) selected`}
                        </span>
                        <Settings2 className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-2">
                        <Input
                          placeholder="Search plans..."
                          className="mb-2"
                          value={upsellPlanSearch}
                          onChange={(e) => setUpsellPlanSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {plans
                            .filter((plan) =>
                              plan.name.toLowerCase().includes(upsellPlanSearch.toLowerCase())
                            )
                            .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                const newSet = new Set(upsellPlanSelectedPlans);
                                if (newSet.has(plan.id)) {
                                  newSet.delete(plan.id);
                                } else {
                                  newSet.add(plan.id);
                                }
                                setUpsellPlanSelectedPlans(newSet);
                              }}
                            >
                              <Checkbox
                                checked={upsellPlanSelectedPlans.has(plan.id)}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium mb-2 block">Upsell Addon</label>
                  <Input
                    placeholder="Enter upsell addon name..."
                    value={upsellAddonName}
                    onChange={(e) => setUpsellAddonName(e.target.value)}
                    className="mb-2"
                  />
                  <label className="text-sm font-medium mb-2 block">Select Plans for Upsell Addon</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {upsellAddonSelectedPlans.size === 0
                            ? "Select plans..."
                            : `${upsellAddonSelectedPlans.size} plan(s) selected`}
                        </span>
                        <Settings2 className="ml-2 h-4 w-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <div className="p-2">
                        <Input
                          placeholder="Search plans..."
                          className="mb-2"
                          value={upsellAddonSearch}
                          onChange={(e) => setUpsellAddonSearch(e.target.value)}
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {plans
                            .filter((plan) =>
                              plan.name.toLowerCase().includes(upsellAddonSearch.toLowerCase())
                            )
                            .map((plan) => (
                            <div
                              key={plan.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => {
                                const newSet = new Set(upsellAddonSelectedPlans);
                                if (newSet.has(plan.id)) {
                                  newSet.delete(plan.id);
                                } else {
                                  newSet.add(plan.id);
                                }
                                setUpsellAddonSelectedPlans(newSet);
                              }}
                            >
                              <Checkbox
                                checked={upsellAddonSelectedPlans.has(plan.id)}
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
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddFeatureDialog(false);
                setNewFeatureName("");
                setCopyFromFeatureId("");
                setNewFeatureDefaults({
                  canEnabled: false,
                  canEnabledWithFlag: false,
                  canEnabledInTrial: false,
                  upsellPlanId: "",
                  upsellAddonId: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFeature}
              disabled={!newFeatureName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
