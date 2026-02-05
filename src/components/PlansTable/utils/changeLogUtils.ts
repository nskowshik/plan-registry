import html2canvas from "html2canvas";
import JSZip from "jszip";
import { ChangedFeature } from "../types";
import { Plan, Feature } from "@/data/plansData";

export const generateChangeLogImages = async (
  element: HTMLDivElement,
  zip: JSZip
): Promise<void> => {
  const originalOverflow = element.style.overflow;
  const originalMaxHeight = element.style.maxHeight;
  element.style.overflow = "visible";
  element.style.maxHeight = "none";

  const fullCanvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    removeContainer: true,
  });

  element.style.overflow = originalOverflow;
  element.style.maxHeight = originalMaxHeight;

  const A4_HEIGHT = 1123;
  const fullHeight = fullCanvas.height;
  const scaledA4Height = A4_HEIGHT * 1.5;
  const numPages = Math.ceil(fullHeight / scaledA4Height);

  for (let i = 0; i < numPages; i++) {
    const pageCanvas = document.createElement("canvas");
    const pageHeight = Math.min(
      scaledA4Height,
      fullHeight - i * scaledA4Height
    );

    pageCanvas.width = fullCanvas.width;
    pageCanvas.height = pageHeight;

    const ctx = pageCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        fullCanvas,
        0,
        i * scaledA4Height,
        fullCanvas.width,
        pageHeight,
        0,
        0,
        fullCanvas.width,
        pageHeight
      );

      const blob = await new Promise<Blob>((resolve) => {
        pageCanvas.toBlob((blob) => resolve(blob!), "image/png", 0.95);
      });

      zip.file(`change-logs-page-${i + 1}.png`, blob);
    }
  }
};

export const generateChangeLogJSON = (
  changedFeatures: Record<string, ChangedFeature>,
  newlyAddedPlans: string[],
  allPlans: Plan[]
): string => {
  const changeLogData = {
    timestamp: new Date().toISOString(),
    summary: {
      modifiedFeatures: Object.keys(changedFeatures).length,
      newlyAddedPlans: newlyAddedPlans.length,
    },
    changedFeatures,
    newlyAddedPlans: newlyAddedPlans.map((planId) => {
      const plan = allPlans.find((p) => p.id === planId);
      return {
        planId,
        planName: plan?.name,
      };
    }),
  };

  return JSON.stringify(changeLogData, null, 2);
};
