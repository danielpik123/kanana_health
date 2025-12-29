"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Biomarker } from "@/types/biomarker";
import { VisualScale } from "./VisualScale";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface BiomarkerTableProps {
  biomarkers: Biomarker[] | null;
  loading?: boolean;
}

const statusBadgeColors = {
  optimal: "bg-accent/20 text-accent border-accent/30",
  "sub-optimal": "bg-warning/20 text-warning border-warning/30",
  danger: "bg-destructive/20 text-destructive border-destructive/30",
};

export function BiomarkerTable({ biomarkers, loading }: BiomarkerTableProps) {
  if (loading) {
    return (
      <div className="glass-card rounded-lg border p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!biomarkers || biomarkers.length === 0) {
    return (
      <div className="glass-card rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No biomarker data available.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload a PDF test result to see your biomarkers here.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Biomarker</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="hidden md:table-cell">Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px] md:w-[300px]">Visual Scale</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {biomarkers.map((biomarker) => (
            <TableRow key={biomarker.id}>
              <TableCell className="font-medium">{biomarker.name}</TableCell>
              <TableCell>{biomarker.value}</TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                {biomarker.unit}
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium border",
                    statusBadgeColors[biomarker.status]
                  )}
                >
                  {biomarker.status.replace("-", " ")}
                </span>
              </TableCell>
              <TableCell>
                <VisualScale biomarker={biomarker} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

