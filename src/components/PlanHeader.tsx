import { Plan } from "@/data/plansData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanHeaderProps {
  plan: Plan;
}

const PlanHeader = ({ plan }: PlanHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 text-center transition-all duration-200",
        plan.isPopular && "plan-highlight rounded-t-lg bg-primary/5"
      )}
    >
      {plan.isPopular && (
        <Badge className="mb-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Most Popular
        </Badge>
      )}
      <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
        {plan.price !== "Custom" && (
          <span className="text-sm text-muted-foreground">/month</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
    </div>
  );
};

export default PlanHeader;
