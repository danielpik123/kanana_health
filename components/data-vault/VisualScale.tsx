"use client";

import { Biomarker } from "@/types/biomarker";
import { cn } from "@/lib/utils";

interface VisualScaleProps {
  biomarker: Biomarker;
}

export function VisualScale({ biomarker }: VisualScaleProps) {
  const { value, optimalRange, status } = biomarker;
  const { min, max } = optimalRange;

  // Calculate the range for visualization
  const range = max - min;
  const extendedMin = Math.max(0, min - range * 0.2);
  const extendedMax = max + range * 0.2;
  const extendedRange = extendedMax - extendedMin;

  // Calculate positions as percentages
  const optimalStart = ((min - extendedMin) / extendedRange) * 100;
  const optimalEnd = ((max - extendedMin) / extendedRange) * 100;
  const valuePosition = ((value - extendedMin) / extendedRange) * 100;

  const statusColors = {
    optimal: "bg-accent",
    "sub-optimal": "bg-warning",
    danger: "bg-destructive",
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative h-6 bg-muted rounded-full overflow-hidden">
        {/* Optimal zone (green) */}
        <div
          className="absolute h-full bg-accent/30"
          style={{
            left: `${optimalStart}%`,
            width: `${optimalEnd - optimalStart}%`,
          }}
        />
        {/* Sub-optimal zones (yellow) */}
        <div
          className="absolute h-full bg-warning/20"
          style={{
            left: `${Math.max(0, optimalStart - 10)}%`,
            width: `${Math.min(10, optimalStart)}%`,
          }}
        />
        <div
          className="absolute h-full bg-warning/20"
          style={{
            left: `${optimalEnd}%`,
            width: `${Math.min(10, 100 - optimalEnd)}%`,
          }}
        />
        {/* Danger zones (red) */}
        <div
          className="absolute h-full bg-destructive/20"
          style={{
            left: "0%",
            width: `${Math.max(0, optimalStart - 10)}%`,
          }}
        />
        <div
          className="absolute h-full bg-destructive/20"
          style={{
            left: `${Math.min(100, optimalEnd + 10)}%`,
            width: `${Math.max(0, 100 - optimalEnd - 10)}%`,
          }}
        />
        {/* Current value indicator */}
        <div
          className={cn(
            "absolute top-0 h-full w-1 transition-all duration-500",
            statusColors[status]
          )}
          style={{ left: `${Math.max(0, Math.min(100, valuePosition))}%` }}
        >
          <div
            className={cn(
              "absolute -top-1 -left-2 w-5 h-5 rounded-full border-2 border-background",
              statusColors[status]
            )}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{extendedMin.toFixed(1)}</span>
        <span className="text-accent">Optimal: {min} - {max}</span>
        <span>{extendedMax.toFixed(1)}</span>
      </div>
    </div>
  );
}

