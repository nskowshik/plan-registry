import { Check, X } from "lucide-react";

interface FeatureCheckProps {
  checked: boolean;
}

const FeatureCheck = ({ checked }: FeatureCheckProps) => {
  return (
    <div className="flex items-center justify-center">
      {checked ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-4 w-4 check-active" />
        </div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center">
          <X className="h-4 w-4 check-inactive" />
        </div>
      )}
    </div>
  );
};

export default FeatureCheck;
