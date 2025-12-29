import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import { Test } from "@/types/test";
import { Biomarker } from "@/types/biomarker";

// Admin SDK is only used server-side, loaded dynamically to avoid client bundle issues
async function getAdminDb() {
  if (typeof window !== "undefined") {
    return null; // Never use admin SDK on client
  }
  try {
    // Dynamic import - webpack will ignore this due to IgnorePlugin in next.config.ts
    // The IgnorePlugin ensures firebase-admin is never bundled for client builds
    const adminModule = await import("./admin");
    // Use the async getter instead of direct access
    return await adminModule.getAdminDb();
  } catch (error) {
    return null; // Admin SDK not available, will use client SDK
  }
}

/**
 * Normalize date to start of day for grouping tests by date
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Check if two biomarkers are the same (same name and unit)
 */
function isSameBiomarker(b1: Biomarker, b2: Biomarker): boolean {
  return b1.name.toLowerCase() === b2.name.toLowerCase() && b1.unit === b2.unit;
}

/**
 * Merge biomarkers from new test into existing test
 * If same biomarker exists, keep both entries (user can see all values)
 */
function mergeBiomarkers(
  existing: Biomarker[],
  newBiomarkers: Biomarker[]
): Biomarker[] {
  const merged = [...existing];

  for (const newBio of newBiomarkers) {
    // Check if exact duplicate (same name, unit, and value)
    const isDuplicate = existing.some(
      (existingBio) =>
        isSameBiomarker(existingBio, newBio) &&
        existingBio.value === newBio.value
    );

    if (!isDuplicate) {
      merged.push(newBio);
    }
  }

  return merged;
}

/**
 * Ensure user document exists in Firestore
 * Creates it if it doesn't exist
 * Uses Admin SDK if available (server-side), otherwise client SDK
 */
async function ensureUserDocument(userId: string): Promise<void> {
  // Try Admin SDK for server-side operations (bypasses security rules)
  const adminDbInstance = await getAdminDb();
  if (adminDbInstance) {
    const userRef = adminDbInstance.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        createdAt: adminDbInstance.Timestamp.now(),
        updatedAt: adminDbInstance.Timestamp.now(),
      });
    }
    return;
  }

  // Fallback to client SDK
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    await setDoc(userRef, {
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

/**
 * Save test to Firestore
 * If test exists for the same date, merge biomarkers
 */
export async function saveTest(
  userId: string,
  testData: Omit<Test, "id" | "userId">
): Promise<Test> {
  // Try Admin SDK for server-side operations (bypasses security rules)
  const adminDbInstance = await getAdminDb();
  if (adminDbInstance) {
    await ensureUserDocument(userId);

    // Convert testDate to Date, handling both Date and Firestore Timestamp
    let testDateValue: Date;
    if (testData.testDate instanceof Date) {
      testDateValue = testData.testDate;
    } else if (testData.testDate && typeof (testData.testDate as any).toDate === "function") {
      // Firestore Timestamp - convert to Date
      testDateValue = (testData.testDate as any).toDate();
    } else if (testData.testDate) {
      // Fallback: if it's a number or string, create Date from it
      const dateValue = testData.testDate as any;
      if (typeof dateValue === "number" || typeof dateValue === "string") {
        testDateValue = new Date(dateValue);
      } else {
        testDateValue = new Date();
      }
    } else {
      testDateValue = new Date();
    }
    const normalizedDate = normalizeDate(testDateValue);

    // Check if test exists for this date using Admin SDK
    const testsRef = adminDbInstance.collection("users").doc(userId).collection("tests");
    const startOfDay = adminDbInstance.Timestamp.fromDate(normalizedDate);
    const endOfDay = adminDbInstance.Timestamp.fromDate(new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000));
    
    const existingTests = await testsRef
      .where("testDate", ">=", startOfDay)
      .where("testDate", "<", endOfDay)
      .get();

    let testId: string;
    let finalBiomarkers: Biomarker[];

    if (!existingTests.empty) {
      const existingTestDoc = existingTests.docs[0];
      testId = existingTestDoc.id;
      const existingTest = existingTestDoc.data() as Test;
      finalBiomarkers = mergeBiomarkers(
        existingTest.biomarkers,
        testData.biomarkers
      );
    } else {
      testId = testsRef.doc().id;
      finalBiomarkers = testData.biomarkers;
    }

    const testDataToSave: any = {
      id: testId,
      userId,
      testDate: startOfDay,
      uploadedAt: adminDbInstance.Timestamp.fromDate(
        testData.uploadedAt instanceof Date
          ? testData.uploadedAt
          : (testData.uploadedAt && typeof (testData.uploadedAt as any).toDate === "function")
          ? (testData.uploadedAt as any).toDate()
          : typeof testData.uploadedAt === "number" || typeof testData.uploadedAt === "string"
          ? new Date(testData.uploadedAt)
          : new Date()
      ),
      biomarkers: finalBiomarkers,
      source: testData.source,
    };

    // Only include pdfUrl if it's defined
    if (testData.pdfUrl) {
      testDataToSave.pdfUrl = testData.pdfUrl;
    }

    await testsRef.doc(testId).set(testDataToSave);

    const test: Test = {
      id: testId,
      userId,
      testDate: startOfDay,
      uploadedAt: testDataToSave.uploadedAt,
      biomarkers: finalBiomarkers,
      pdfUrl: testData.pdfUrl,
      source: testData.source,
    };

    return test;
  }

  // Fallback to client SDK
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  // Ensure user document exists before creating subcollection
  await ensureUserDocument(userId);

  // Convert testDate to Date, handling both Date and Firestore Timestamp
  let testDateValue: Date;
  if (testData.testDate instanceof Date) {
    testDateValue = testData.testDate;
  } else if (testData.testDate && typeof (testData.testDate as any).toDate === "function") {
    // Firestore Timestamp - convert to Date
    testDateValue = (testData.testDate as any).toDate();
  } else if (testData.testDate) {
    // Fallback: if it's a number or string, create Date from it
    const dateValue = testData.testDate as any;
    if (typeof dateValue === "number" || typeof dateValue === "string") {
      testDateValue = new Date(dateValue);
    } else {
      testDateValue = new Date();
    }
  } else {
    testDateValue = new Date();
  }
  const normalizedDate = normalizeDate(testDateValue);

  // Check if test exists for this date
  const testsRef = collection(db, "users", userId, "tests");
  const dateQuery = query(
    testsRef,
    where("testDate", ">=", Timestamp.fromDate(normalizedDate)),
    where("testDate", "<", Timestamp.fromDate(new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)))
  );

  const existingTests = await getDocs(dateQuery);

  let testId: string;
  let finalBiomarkers: Biomarker[];

  if (!existingTests.empty) {
    // Merge with existing test
    const existingTestDoc = existingTests.docs[0];
    testId = existingTestDoc.id;
    const existingTest = existingTestDoc.data() as Test;
    finalBiomarkers = mergeBiomarkers(
      existingTest.biomarkers,
      testData.biomarkers
    );
  } else {
    // Create new test
    testId = doc(testsRef).id;
    finalBiomarkers = testData.biomarkers;
  }

  const testDataToSave: any = {
    id: testId,
    userId,
    testDate: Timestamp.fromDate(normalizedDate),
    uploadedAt: Timestamp.fromDate(
      testData.uploadedAt instanceof Date
        ? testData.uploadedAt
        : (testData.uploadedAt && typeof (testData.uploadedAt as any).toDate === "function")
        ? (testData.uploadedAt as any).toDate()
        : typeof testData.uploadedAt === "number" || typeof testData.uploadedAt === "string"
        ? new Date(testData.uploadedAt)
        : new Date()
    ),
    biomarkers: finalBiomarkers,
    source: testData.source,
  };

  // Only include pdfUrl if it's defined
  if (testData.pdfUrl) {
    testDataToSave.pdfUrl = testData.pdfUrl;
  }

  await setDoc(doc(testsRef, testId), testDataToSave);

  const test: Test = {
    id: testId,
    userId,
    testDate: Timestamp.fromDate(normalizedDate),
    uploadedAt: testDataToSave.uploadedAt,
    biomarkers: finalBiomarkers,
    pdfUrl: testData.pdfUrl,
    source: testData.source,
  };

  return test;
}

/**
 * Get all tests for a user, ordered by date (latest first)
 */
export async function getUserTests(userId: string): Promise<Test[]> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const testsRef = collection(db, "users", userId, "tests");
  const q = query(testsRef, orderBy("testDate", "desc"));

  const querySnapshot = await getDocs(q);
  const tests: Test[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    tests.push({
      id: doc.id,
      ...data,
      testDate: data.testDate.toDate(),
      uploadedAt: data.uploadedAt.toDate(),
    } as Test);
  });

  return tests;
}

/**
 * Get test for a specific date
 */
export async function getTestByDate(
  userId: string,
  date: Date
): Promise<Test | null> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const normalizedDate = normalizeDate(date);
  const testsRef = collection(db, "users", userId, "tests");
  const dateQuery = query(
    testsRef,
    where("testDate", ">=", Timestamp.fromDate(normalizedDate)),
    where("testDate", "<", Timestamp.fromDate(new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000)))
  );

  const querySnapshot = await getDocs(dateQuery);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    testDate: data.testDate.toDate(),
    uploadedAt: data.uploadedAt.toDate(),
  } as Test;
}

/**
 * Get a specific test by ID
 */
export async function getTestById(
  userId: string,
  testId: string
): Promise<Test | null> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const testRef = doc(db, "users", userId, "tests", testId);
  const testDoc = await getDoc(testRef);

  if (!testDoc.exists()) {
    return null;
  }

  const data = testDoc.data();
  return {
    id: testDoc.id,
    ...data,
    testDate: data.testDate.toDate(),
    uploadedAt: data.uploadedAt.toDate(),
  } as Test;
}

