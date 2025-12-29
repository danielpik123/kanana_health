"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { Biomarker } from "@/types/biomarker";

interface TrendDataPoint {
  date: string;
  value: number;
  testDate: Date;
}

interface BiomarkerTrendProps {
  biomarkerName: string;
  dataPoints: TrendDataPoint[];
  optimalRange: { min: number; max: number };
  unit: string;
}

export function BiomarkerTrend({
  biomarkerName,
  dataPoints,
  optimalRange,
  unit,
}: BiomarkerTrendProps) {
  if (dataPoints.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Sort by date
  const sortedData = [...dataPoints].sort(
    (a, b) => a.testDate.getTime() - b.testDate.getTime()
  );

  // Calculate Y-axis domain with padding
  const values = sortedData.map((d) => d.value);
  const minValue = Math.min(...values, optimalRange.min);
  const maxValue = Math.max(...values, optimalRange.max);
  const padding = (maxValue - minValue) * 0.2;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{biomarkerName}</h4>
        <span className="text-xs text-muted-foreground">
          Optimal: {optimalRange.min} - {optimalRange.max} {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              fill: "rgba(255, 255, 255, 0.7)",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
            }}
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value: number) => [`${value} ${unit}`, "Value"]}
          />
          {/* Optimal range area */}
          <ReferenceArea
            y1={optimalRange.min}
            y2={optimalRange.max}
            stroke="rgba(16, 185, 129, 0.2)"
            fill="rgba(16, 185, 129, 0.1)"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

