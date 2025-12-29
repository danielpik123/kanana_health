// Firebase Admin SDK - Server-side only
// This file should NEVER be imported in client-side code
// All imports are dynamic to prevent webpack from bundling firebase-admin

let adminApp: any;
let adminDb: any;

// Initialize Firebase Admin SDK for server-side operations only
async function initializeAdmin() {
  if (typeof window !== "undefined") {
    return; // Never initialize on client
  }

  if (adminApp && adminDb) {
    return; // Already initialized
  }

  try {
    // Dynamic import to prevent webpack from bundling firebase-admin
    const admin = await import("firebase-admin/app");
    const adminFirestore = await import("firebase-admin/firestore");

    if (!admin.getApps().length) {
      // Check if we have the service account key
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = admin.initializeApp({
          credential: admin.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Use credentials from file path
        adminApp = admin.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        // For local development, try to initialize without credentials
        try {
          adminApp = admin.initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          }, "admin");
        } catch (error) {
          console.warn("Firebase Admin: Could not initialize. Will use client SDK (may have permission issues).");
        }
      }
    } else {
      adminApp = admin.getApps()[0];
    }

    if (adminApp) {
      adminDb = adminFirestore.getFirestore(adminApp);
    }
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error);
    console.warn("Note: Admin SDK requires service account credentials for production.");
  }
}

// Export getters that initialize on first access (server-side only)
export const getAdminApp = async () => {
  await initializeAdmin();
  return adminApp;
};

export const getAdminDb = async () => {
  await initializeAdmin();
  return adminDb;
};

// Legacy exports (for backward compatibility, but prefer getAdminDb)
export { adminApp, adminDb };

