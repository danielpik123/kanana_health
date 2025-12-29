"use client";

import { useEffect, useState } from "react";
import { Test } from "@/types/test";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface TestSelectorProps {
  tests: Test[];
  selectedTest: Test | null;
  onTestSelect: (test: Test | null) => void;
  loading?: boolean;
}

export function TestSelector({ tests, selectedTest, onTestSelect, loading = false }: TestSelectorProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");

  // Update selected date key when selectedTest changes
  useEffect(() => {
    if (selectedTest) {
      const dateKey = getDateKey(selectedTest.testDate);
      setSelectedDateKey(dateKey);
    } else if (tests.length > 0) {
      // Default to latest test if no test is selected
      const latestTest = tests[0];
      const dateKey = getDateKey(latestTest.testDate);
      setSelectedDateKey(dateKey);
      onTestSelect(latestTest);
    }
  }, [selectedTest, tests, onTestSelect]);

  const getDateKey = (testDate: Date | any): string => {
    if (testDate instanceof Date) {
      return testDate.toISOString();
    }
    if (testDate?.toDate) {
      return testDate.toDate().toISOString();
    }
    return new Date(testDate).toISOString();
  };

  const handleSelect = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const selectedTest = tests.find((test) => {
      const testDateKey = getDateKey(test.testDate);
      return testDateKey === dateKey;
    });
    onTestSelect(selectedTest || null);
  };

  const formatDate = (date: Date | any): string => {
    // Convert to Date, handling both Date and Firestore Timestamp
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date.toDate === "function") {
      // Firestore Timestamp
      d = date.toDate();
    } else if (date) {
      // Fallback: if it's a number or string, create Date from it
      const dateValue = date as any;
      if (typeof dateValue === "number" || typeof dateValue === "string") {
        d = new Date(dateValue);
      } else {
        d = new Date();
      }
    } else {
      d = new Date();
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="glass-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Loading tests...</span>
        </div>
      </Card>
    );
  }

  if (tests.length === 0) {
    return (
      <Card className="glass-card p-4">
        <div className="text-sm text-muted-foreground">
          No tests available. Upload a PDF to get started.
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">View Test:</label>
        </div>
        <Select value={selectedDateKey} onValueChange={handleSelect}>
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue placeholder="Select a test date" />
          </SelectTrigger>
          <SelectContent className="glass-card">
            {tests.map((test, index) => {
              // Convert testDate to Date, handling both Date and Firestore Timestamp
              let testDate: Date;
              if (test.testDate instanceof Date) {
                testDate = test.testDate;
              } else if (test.testDate && typeof (test.testDate as any).toDate === "function") {
                // Firestore Timestamp - convert to Date
                testDate = (test.testDate as any).toDate();
              } else if (test.testDate) {
                // Fallback: if it's a number or string, create Date from it
                const dateValue = test.testDate as any;
                if (typeof dateValue === "number" || typeof dateValue === "string") {
                  testDate = new Date(dateValue);
                } else {
                  testDate = new Date();
                }
              } else {
                testDate = new Date();
              }
              const dateKey = getDateKey(test.testDate);
              const isLatest = index === 0;
              const isSelected = selectedTest?.id === test.id;
              
              return (
                <SelectItem key={test.id} value={dateKey}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">
                      {formatDate(testDate)}
                      {isLatest && " • Latest"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {test.biomarkers.length} biomarkers
                    </span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedTest && (
          <div className="text-xs text-muted-foreground sm:ml-auto">
            {selectedTest.biomarkers.length} biomarkers • {formatDate(selectedTest.testDate)}
          </div>
        )}
      </div>
    </Card>
  );
}

