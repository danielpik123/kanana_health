"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WearableData } from "@/types/wearable";
import { WearableChart } from "./WearableChart";
import { Activity, Heart, Moon } from "lucide-react";

interface WearablesViewProps {
  wearableData: WearableData[];
}

export function WearablesView({ wearableData }: WearablesViewProps) {
  const ouraData = wearableData.filter((d) => d.source === "oura");
  const garminData = wearableData.filter((d) => d.source === "garmin");

  const latestOura = ouraData[ouraData.length - 1];
  const latestGarmin = garminData[garminData.length - 1];

  return (
    <div className="space-y-6">
      {/* Oura Integration */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Oura Ring
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {latestOura?.date
                ? new Date(latestOura.date).toLocaleDateString()
                : "Not connected"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {latestOura && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Sleep Score</div>
                <div className="text-3xl font-bold">
                  {latestOura.sleepScore || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">HRV</div>
                <div className="text-3xl font-bold">
                  {latestOura.hrv ? `${latestOura.hrv} ms` : "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Resting Heart Rate
                </div>
                <div className="text-3xl font-bold">
                  {latestOura.restingHeartRate
                    ? `${latestOura.restingHeartRate} bpm`
                    : "N/A"}
                </div>
              </div>
            </div>
          )}
          {ouraData.length > 0 && (
            <div className="space-y-4">
              {latestOura?.sleepScore && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Sleep Score Trend</h4>
                  <WearableChart
                    data={ouraData}
                    dataKey="sleepScore"
                    color="#10b981"
                    name="Sleep Score"
                  />
                </div>
              )}
              {latestOura?.hrv && (
                <div>
                  <h4 className="text-sm font-medium mb-2">HRV Trend</h4>
                  <WearableChart
                    data={ouraData}
                    dataKey="hrv"
                    color="#3b82f6"
                    name="HRV (ms)"
                    unit="ms"
                  />
                </div>
              )}
              {latestOura?.restingHeartRate && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Resting Heart Rate Trend
                  </h4>
                  <WearableChart
                    data={ouraData}
                    dataKey="restingHeartRate"
                    color="#ef4444"
                    name="Resting HR (bpm)"
                    unit="bpm"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Garmin Integration */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Garmin
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {latestGarmin?.date
                ? new Date(latestGarmin.date).toLocaleDateString()
                : "Not connected"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {latestGarmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Steps</div>
                <div className="text-3xl font-bold">
                  {latestGarmin.steps?.toLocaleString() || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="text-3xl font-bold">
                  {latestGarmin.calories || "N/A"}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Active Minutes
                </div>
                <div className="text-3xl font-bold">
                  {latestGarmin.activeMinutes || "N/A"}
                </div>
              </div>
            </div>
          )}
          {latestGarmin?.restingHeartRate && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Resting Heart Rate Trend
              </h4>
              <WearableChart
                data={garminData}
                dataKey="restingHeartRate"
                color="#ef4444"
                name="Resting HR (bpm)"
                unit="bpm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

