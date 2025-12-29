"use client";

import { useAuth } from "@/hooks/useAuth";
import { mockUser } from "@/data/mockData";
import { Calendar, Clock } from "lucide-react";

export function DashboardHeader() {
  const { user } = useAuth();
  const displayName = user?.displayName || mockUser.name;
  
  const lastTestDate = mockUser.lastTestDate
    ? new Date(mockUser.lastTestDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const nextTestDate = mockUser.nextTestDate
    ? new Date(mockUser.nextTestDate)
    : null;

  const daysUntilNextTest = nextTestDate
    ? Math.ceil(
        (nextTestDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Hello {displayName}</h1>
      <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Last test: {lastTestDate}</span>
        </div>
        {daysUntilNextTest !== null && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Next test in {daysUntilNextTest} days</span>
          </div>
        )}
      </div>
    </div>
  );
}

