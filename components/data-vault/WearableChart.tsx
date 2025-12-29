"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WearableData } from "@/types/wearable";

interface WearableChartProps {
  data: WearableData[];
  dataKey: "sleepScore" | "hrv" | "restingHeartRate";
  color: string;
  name: string;
  unit?: string;
}

export function WearableChart({
  data,
  dataKey,
  color,
  name,
  unit = "",
}: WearableChartProps) {
  const chartData = data
    .filter((d) => d[dataKey] !== undefined)
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: d[dataKey],
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="date"
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
        />
        <YAxis
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

