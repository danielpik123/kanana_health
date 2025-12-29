import { Timestamp } from "firebase/firestore";
import { Biomarker } from "./biomarker";

export interface Test {
  id: string;
  userId: string;
  testDate: Timestamp | Date; // Date of the test (normalized to start of day)
  uploadedAt: Timestamp | Date; // When PDF was uploaded
  biomarkers: Biomarker[]; // Array of extracted biomarkers
  pdfUrl?: string; // Optional: URL to stored PDF in Firebase Storage
  source: "pdf_upload";
}

export interface ParsedTestData {
  testDate: Date;
  biomarkers: Omit<Biomarker, "id" | "testDate" | "status">[]; // Status will be calculated
}

