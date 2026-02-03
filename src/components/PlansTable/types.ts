export interface Plan {
  id: string;
  name: string;
}

export interface SubColumn {
  id: string;
  label: string;
  key: string;
}

export interface PlanValue {
  canEnabled?: boolean;
  canEnabledWithFlag?: boolean;
  canEnabledInTrial?: boolean;
  upsellPlanId?: string | null;
  upsellAddonId?: string | null;
}

export interface Feature {
  id: string;
  name: string;
  plans: Record<string, PlanValue>;
}

export interface ChangedFeature {
  status: "NEW" | "RENAMED" | "MODIFIED";
  oldName?: string;
  changes?: Record<string, {
    planId: string;
    planName: string;
    changes: Record<string, { old: any; new: any }>;
  }>;
  planData?: Record<string, {
    planId: string;
    planName: string;
    data: Record<string, any>;
  }>;
}
