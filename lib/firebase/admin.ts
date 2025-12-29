import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

// Initialize Firebase Admin SDK for server-side operations
if (typeof window === "undefined") {
  try {
    if (!getApps().length) {
      // Check if we have the service account key
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use credentials from file path
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        // For local development, try to initialize without credentials
        // This will work if you're using Firebase Emulator or have Application Default Credentials
        try {
          adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          }, "admin");
        } catch (error) {
          console.warn("Firebase Admin: Could not initialize. Will use client SDK (may have permission issues).");
        }
      }
    } else {
      adminApp = getApps()[0];
    }

    if (adminApp) {
      adminDb = getFirestore(adminApp);
    }
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error);
    console.warn("Note: Admin SDK requires service account credentials for production.");
  }
}

export { adminApp, adminDb };

