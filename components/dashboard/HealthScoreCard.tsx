"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HealthScoreCardProps {
  category: string;
  score: number;
  status: "excellent" | "good" | "fair" | "poor";
}

const statusColors = {
  excellent: "text-accent border-accent",
  good: "text-primary border-primary",
  fair: "text-warning border-warning",
  poor: "text-destructive border-destructive",
};

const statusBgColors = {
  excellent: "bg-accent/10",
  good: "bg-primary/10",
  fair: "bg-warning/10",
  poor: "bg-destructive/10",
};

export function HealthScoreCard({ category, score, status }: HealthScoreCardProps) {
  return (
    <Card className={cn("glass-card", statusBgColors[status])}>
      <CardHeader>
        <CardTitle className="text-lg capitalize">{category}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold", statusColors[status])}>
              {score}
            </span>
            <span className="text-muted-foreground">/ 100</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Score</span>
              <span className="capitalize">{status}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-1000",
                  status === "excellent" && "bg-accent",
                  status === "good" && "bg-primary",
                  status === "fair" && "bg-warning",
                  status === "poor" && "bg-destructive"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

