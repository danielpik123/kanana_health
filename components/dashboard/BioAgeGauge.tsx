"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUser } from "@/data/mockData";

export function BioAgeGauge() {
  const bioAge = mockUser.bioAge;
  const chronologicalAge = mockUser.chronologicalAge;
  const difference = chronologicalAge - bioAge;
  const percentage = (bioAge / chronologicalAge) * 100;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Biological Age</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Circular Gauge */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 5.52} 552`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold">{bioAge}</div>
              <div className="text-sm text-muted-foreground">years</div>
            </div>
          </div>

          {/* Comparison */}
          <div className="text-center space-y-2">
            <div className="text-2xl font-semibold">
              {difference > 0 ? (
                <span className="text-accent">
                  {difference} years younger
                </span>
              ) : difference < 0 ? (
                <span className="text-destructive">
                  {Math.abs(difference)} years older
                </span>
              ) : (
                <span>Same age</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Chronological age: {chronologicalAge} years
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

