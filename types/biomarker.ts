export type BiomarkerStatus = "optimal" | "sub-optimal" | "danger";

export interface OptimalRange {
  min: number;
  max: number;
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  optimalRange: OptimalRange;
  status: BiomarkerStatus;
  testDate: Date;
  category: "metabolic" | "hormones" | "nutrients" | "cardiovascular" | "other";
}

