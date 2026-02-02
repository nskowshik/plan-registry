import { Button } from "@/components/ui/button";
import { FileDown, Edit3, Eye, GitCompare } from "lucide-react";
import { ColumnConfigPopover } from "./ColumnConfigPopover";
import { Plan } from "../types";

interface TableToolbarProps {
  isEditMode: boolean;
  onToggleMode: () => void;
  onExport: () => void;
  onShowChangeLogs: () => void;
  plans: Plan[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (planId: string) => void;
  onToggleAllColumns: () => void;
}

export const TableToolbar = ({
  isEditMode,
  onToggleMode,
  onExport,
  onShowChangeLogs,
  plans,
  visibleColumns,
  onToggleColumn,
  onToggleAllColumns,
}: TableToolbarProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Feature Gating Configuration</h2>
      <div className="flex gap-2">
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleMode}
        >
          {isEditMode ? (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Switch to Read Mode
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Switch to Edit Mode
            </>
          )}
        </Button>
        <ColumnConfigPopover
          plans={plans}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          onToggleAll={onToggleAllColumns}
        />
        <Button variant="outline" size="sm" onClick={onExport}>
          <FileDown className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={onShowChangeLogs}>
          <GitCompare className="h-4 w-4 mr-2" />
          Change Logs
        </Button>
      </div>
    </div>
  );
};
