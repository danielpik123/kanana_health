export interface WearableData {
  id: string;
  date: Date;
  source: "garmin" | "oura";
  sleepScore?: number;
  hrv?: number; // Heart Rate Variability in ms
  restingHeartRate?: number; // bpm
  steps?: number;
  calories?: number;
  activeMinutes?: number;
}

export interface WearableIntegration {
  id: string;
  type: "garmin" | "oura";
  connected: boolean;
  lastSync?: Date;
  userId: string;
}

