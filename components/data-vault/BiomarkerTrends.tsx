"use client";

import { useMemo } from "react";
import { Test } from "@/types/test";
import { BiomarkerTrend } from "./BiomarkerTrend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BiomarkerTrendsProps {
  tests: Test[];
}

interface TrendDataPoint {
  date: string;
  value: number;
  testDate: Date;
}

export function BiomarkerTrends({ tests }: BiomarkerTrendsProps) {
  // Group biomarkers by name and create time series
  const biomarkerTrends = useMemo(() => {
    const trendsMap = new Map<
      string,
      {
        name: string;
        unit: string;
        optimalRange: { min: number; max: number };
        category: string;
        dataPoints: TrendDataPoint[];
      }
    >();

    tests.forEach((test) => {
      const testDate =
        test.testDate instanceof Date
          ? test.testDate
          : (test.testDate as any).toDate?.() || new Date(test.testDate);

      test.biomarkers.forEach((biomarker) => {
        const key = `${biomarker.name}_${biomarker.unit}`;
        const dateStr = testDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        if (!trendsMap.has(key)) {
          trendsMap.set(key, {
            name: biomarker.name,
            unit: biomarker.unit,
            optimalRange: biomarker.optimalRange,
            category: biomarker.category,
            dataPoints: [],
          });
        }

        const trend = trendsMap.get(key)!;
        trend.dataPoints.push({
          date: dateStr,
          value: biomarker.value,
          testDate,
        });
      });
    });

    return Array.from(trendsMap.values());
  }, [tests]);

  // Group by category
  const byCategory = useMemo(() => {
    const categories: Record<string, typeof biomarkerTrends> = {};
    biomarkerTrends.forEach((trend) => {
      if (!categories[trend.category]) {
        categories[trend.category] = [];
      }
      categories[trend.category].push(trend);
    });
    return categories;
  }, [biomarkerTrends]);

  if (biomarkerTrends.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No trend data available.</p>
          <p className="text-sm mt-2">
            Upload multiple test results to see trends over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(byCategory);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Biomarker Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length > 1 ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {byCategory[category].map((trend) => (
                    <Card key={`${trend.name}_${trend.unit}`} className="bg-card/50">
                      <CardContent className="pt-6">
                        <BiomarkerTrend
                          biomarkerName={trend.name}
                          dataPoints={trend.dataPoints}
                          optimalRange={trend.optimalRange}
                          unit={trend.unit}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {biomarkerTrends.map((trend) => (
              <Card key={`${trend.name}_${trend.unit}`} className="bg-card/50">
                <CardContent className="pt-6">
                  <BiomarkerTrend
                    biomarkerName={trend.name}
                    dataPoints={trend.dataPoints}
                    optimalRange={trend.optimalRange}
                    unit={trend.unit}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

