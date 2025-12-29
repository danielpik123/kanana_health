"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BiomarkerTable } from "@/components/data-vault/BiomarkerTable";
import { WearablesView } from "@/components/data-vault/WearablesView";
import { TestSelector } from "@/components/data-vault/TestSelector";
import { BiomarkerTrends } from "@/components/data-vault/BiomarkerTrends";
import { useAuth } from "@/hooks/useAuth";
import { getUserTests } from "@/lib/firebase/tests";
import { Test } from "@/types/test";
import { mockWearableData } from "@/data/mockData";
import { Loader2 } from "lucide-react";

// Dynamically import PDFUpload with SSR disabled to avoid pdfjs-dist server-side issues
const PDFUpload = dynamic(
  () => import("@/components/data-vault/PDFUpload").then((mod) => ({ default: mod.PDFUpload })),
  { ssr: false }
);

export default function DataVaultPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userTests = await getUserTests(user.uid);
      setTests(userTests);

      // Select latest test by default
      if (userTests.length > 0 && !selectedTest) {
        setSelectedTest(userTests[0]);
      }
    } catch (error) {
      console.error("Error loading tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadTests();
  };

  const handleTestSelect = (test: Test | null) => {
    setSelectedTest(test);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Data Vault</h1>
        <p className="text-muted-foreground">
          View and analyze your biomarker tests and wearable data
        </p>
      </div>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList>
          <TabsTrigger value="tests">Biomarker Tests</TabsTrigger>
          <TabsTrigger value="wearables">Wearables</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="mt-6 space-y-6">
          {/* Upload Section */}
          <PDFUpload onUploadSuccess={handleUploadSuccess} />

          {/* Test Selector */}
          {user && tests.length > 0 && (
            <TestSelector
              tests={tests}
              selectedTest={selectedTest}
              onTestSelect={handleTestSelect}
              loading={loading}
            />
          )}

          {/* Biomarker Table */}
          {loading ? (
            <div className="glass-card rounded-lg border p-8 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedTest ? (
            <BiomarkerTable
              biomarkers={selectedTest.biomarkers}
              loading={false}
            />
          ) : tests.length === 0 ? (
            <div className="glass-card rounded-lg border p-8 text-center text-muted-foreground">
              No tests available. Upload a PDF to get started.
            </div>
          ) : null}

          {/* Trends Section */}
          {tests.length > 1 && (
            <div className="mt-8">
              <BiomarkerTrends tests={tests} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="wearables" className="mt-6">
          <WearablesView wearableData={mockWearableData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
