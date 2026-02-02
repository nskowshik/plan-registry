import { useState, useMemo } from "react";
import { plans } from "@/data/plansData";

export const useColumnVisibility = () => {
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    plans.reduce(
      (acc, plan) => {
        acc[plan.id] = true;
        return acc;
      },
      {} as Record<string, boolean>
    )
  );
  const [columnSearchQuery, setColumnSearchQuery] = useState("");

  const toggleColumn = (planId: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const toggleAllColumns = () => {
    const allVisible = Object.values(visibleColumns).every((v) => v);
    setVisibleColumns(
      plans.reduce(
        (acc, plan) => {
          acc[plan.id] = !allVisible;
          return acc;
        },
        {} as Record<string, boolean>
      )
    );
  };

  const visiblePlans = useMemo(
    () => plans.filter((plan) => visibleColumns[plan.id]),
    [visibleColumns]
  );

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) =>
        plan.name.toLowerCase().includes(columnSearchQuery.toLowerCase())
      ),
    [columnSearchQuery]
  );

  return {
    visibleColumns,
    columnSearchQuery,
    setColumnSearchQuery,
    toggleColumn,
    toggleAllColumns,
    visiblePlans,
    filteredPlans,
  };
};
