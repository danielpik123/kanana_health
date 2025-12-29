import { User } from "@/types/user";
import { Biomarker } from "@/types/biomarker";
import { WearableData } from "@/types/wearable";

// Mock User Data
export const mockUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  bioAge: 32,
  chronologicalAge: 35,
  lastTestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  nextTestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
};

// Health Scores
export interface HealthScore {
  category: "metabolic" | "hormones" | "nutrients" | "cardiovascular";
  score: number; // 0-100
  status: "excellent" | "good" | "fair" | "poor";
}

export const healthScores: HealthScore[] = [
  {
    category: "metabolic",
    score: 78,
    status: "good",
  },
  {
    category: "hormones",
    score: 65,
    status: "fair",
  },
  {
    category: "nutrients",
    score: 82,
    status: "good",
  },
  {
    category: "cardiovascular",
    score: 88,
    status: "excellent",
  },
];

// Mock Biomarker Data
export const mockBiomarkers: Biomarker[] = [
  // Metabolic
  {
    id: "bio-1",
    name: "Vitamin D",
    value: 42,
    unit: "ng/mL",
    optimalRange: { min: 30, max: 100 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "nutrients",
  },
  {
    id: "bio-2",
    name: "Testosterone",
    value: 580,
    unit: "ng/dL",
    optimalRange: { min: 400, max: 1000 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "hormones",
  },
  {
    id: "bio-3",
    name: "LDL Cholesterol",
    value: 145,
    unit: "mg/dL",
    optimalRange: { min: 0, max: 100 },
    status: "sub-optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "cardiovascular",
  },
  {
    id: "bio-4",
    name: "HDL Cholesterol",
    value: 65,
    unit: "mg/dL",
    optimalRange: { min: 40, max: 100 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "cardiovascular",
  },
  {
    id: "bio-5",
    name: "HbA1c",
    value: 5.2,
    unit: "%",
    optimalRange: { min: 4.0, max: 5.6 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "metabolic",
  },
  {
    id: "bio-6",
    name: "Cortisol",
    value: 18,
    unit: "µg/dL",
    optimalRange: { min: 10, max: 20 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "hormones",
  },
  {
    id: "bio-7",
    name: "Magnesium",
    value: 1.8,
    unit: "mg/dL",
    optimalRange: { min: 1.7, max: 2.2 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "nutrients",
  },
  {
    id: "bio-8",
    name: "B12",
    value: 280,
    unit: "pg/mL",
    optimalRange: { min: 200, max: 900 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "nutrients",
  },
  {
    id: "bio-9",
    name: "Triglycerides",
    value: 120,
    unit: "mg/dL",
    optimalRange: { min: 0, max: 150 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "cardiovascular",
  },
  {
    id: "bio-10",
    name: "TSH",
    value: 2.1,
    unit: "mIU/L",
    optimalRange: { min: 0.4, max: 4.0 },
    status: "optimal",
    testDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    category: "hormones",
  },
];

// Generate 30 days of wearable data
export const generateWearableData = (): WearableData[] => {
  const data: WearableData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Oura data
    data.push({
      id: `oura-${i}`,
      date,
      source: "oura",
      sleepScore: Math.floor(Math.random() * 20) + 70, // 70-90
      hrv: Math.floor(Math.random() * 30) + 40, // 40-70 ms
      restingHeartRate: Math.floor(Math.random() * 10) + 50, // 50-60 bpm
    });

    // Garmin data
    data.push({
      id: `garmin-${i}`,
      date,
      source: "garmin",
      steps: Math.floor(Math.random() * 5000) + 8000, // 8000-13000
      calories: Math.floor(Math.random() * 500) + 2000, // 2000-2500
      activeMinutes: Math.floor(Math.random() * 30) + 30, // 30-60
      restingHeartRate: Math.floor(Math.random() * 8) + 52, // 52-60 bpm
    });
  }

  return data;
};

export const mockWearableData = generateWearableData();

