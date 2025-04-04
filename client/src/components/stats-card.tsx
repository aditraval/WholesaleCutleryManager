import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";
import { Italic } from "lucide-react";
import { cn } from "@/lib/utils";

const iconVariants = cva(
  "p-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-600",
        success: "bg-green-100 text-green-600",
        warning: "bg-yellow-100 text-yellow-600",
        info: "bg-blue-100 text-blue-600",
        danger: "bg-red-100 text-red-600"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface StatsCardProps extends VariantProps<typeof iconVariants> {
  title: string;
  value: string | number;
  icon: Italic;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label: string;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant,
  className
}: StatsCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-neutral-800">{value}</h3>
          </div>
          <div className={iconVariants({ variant })}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            {trend.isPositive !== undefined && (
              <span className={cn("font-medium flex items-center", trend.isPositive ? "text-green-600" : "text-red-600")}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={cn("h-4 w-4 mr-1", trend.isPositive ? "rotate-0" : "rotate-180")}
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V7z" clipRule="evenodd" />
                </svg>
                {trend.value}
              </span>
            )}
            <span className="text-neutral-500 ml-2">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default StatsCard;
