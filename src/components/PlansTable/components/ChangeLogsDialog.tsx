import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChangedFeature } from "../types";

interface ChangeLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changedFeatures: Record<string, ChangedFeature>;
}

export const ChangeLogsDialog = ({
  open,
  onOpenChange,
  changedFeatures,
}: ChangeLogsDialogProps) => {
  const changeLogsContentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Change Logs</DialogTitle>
          <DialogDescription>
            {Object.keys(changedFeatures).length === 0
              ? "No changes detected"
              : `${Object.keys(changedFeatures).length} feature(s) modified`}
          </DialogDescription>
        </DialogHeader>
        <div
          ref={changeLogsContentRef}
          className="flex-1 overflow-auto p-4 space-y-4"
        >
          {Object.keys(changedFeatures).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No changes have been made to the features.
            </div>
          ) : (
            Object.entries(changedFeatures).map(
              ([featureName, featureData]) => (
                <div
                  key={featureName}
                  className="border rounded-lg p-4 bg-card"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-lg">{featureName}</h3>
                    <Badge
                      variant={
                        featureData.status === "NEW"
                          ? "default"
                          : featureData.status === "RENAMED"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {featureData.status}
                    </Badge>
                  </div>

                  {featureData.status === "RENAMED" && (
                    <div className="mb-3 text-sm">
                      <span className="text-muted-foreground">
                        Old name:{" "}
                      </span>
                      <span className="line-through text-red-600 dark:text-red-400">
                        {featureData.oldName}
                      </span>
                      <span className="mx-2">→</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {featureName}
                      </span>
                    </div>
                  )}

                  {featureData.status === "MODIFIED" &&
                    featureData.changes &&
                    Object.entries(featureData.changes).map(
                      ([planId, planChange]) => (
                        <div key={planId} className="mb-4 last:mb-0">
                          <h4 className="font-medium text-sm mb-2">
                            {planChange.planName}
                          </h4>
                          <div className="space-y-2 pl-4">
                            {Object.entries(planChange.changes).map(
                              ([key, change]) => (
                                <div
                                  key={key}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground min-w-[180px]">
                                    {key}:
                                  </span>
                                  <span className="line-through text-red-600 dark:text-red-400">
                                    {String(change.old ?? "null")}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {String(change.new ?? "null")}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}

                  {featureData.status === "RENAMED" &&
                    featureData.changes &&
                    Object.entries(featureData.changes).map(
                      ([planId, planChange]) => (
                        <div key={planId} className="mb-4 last:mb-0">
                          <h4 className="font-medium text-sm mb-2">
                            {planChange.planName}
                          </h4>
                          <div className="space-y-2 pl-4">
                            {Object.entries(planChange.changes).map(
                              ([key, change]) => (
                                <div
                                  key={key}
                                  className="text-sm flex items-center gap-2"
                                >
                                  <span className="text-muted-foreground min-w-[180px]">
                                    {key}:
                                  </span>
                                  <span className="line-through text-red-600 dark:text-red-400">
                                    {String(change.old ?? "null")}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {String(change.new ?? "null")}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                </div>
              )
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
