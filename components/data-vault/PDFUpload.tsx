"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple toast display component
function ToastDisplay({ toasts }: { toasts: Array<{ id: string; title: string; description?: string; variant?: string }> }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border ${
            toast.variant === "destructive"
              ? "bg-destructive/90 text-white border-destructive"
              : "bg-card text-card-foreground border-border"
          }`}
        >
          <p className="font-medium">{toast.title}</p>
          {toast.description && (
            <p className="text-sm opacity-90">{toast.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Convert PDF file to base64 images using PDF.js in the browser
 * Uses dynamic import to ensure pdfjs-dist is only loaded client-side
 */
async function pdfToImages(file: File): Promise<string[]> {
  // Ensure we're in the browser
  if (typeof window === "undefined") {
    throw new Error("PDF processing is only available in the browser");
  }

  // Dynamically import pdfjs-dist only in the browser
  const pdfjsLib = await import("pdfjs-dist");
  
  // Configure PDF.js worker for browser use
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Convert canvas to base64 image
    const base64Image = canvas.toDataURL("image/png");
    images.push(base64Image);
  }

  return images;
}

export function PDFUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast, toasts } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      setErrorMessage("Please upload a PDF file");
      setUploadStatus("error");
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB");
      setUploadStatus("error");
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      setErrorMessage("You must be logged in to upload tests");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("idle");
    setErrorMessage("");

    try {
      setUploadProgress(10);
      
      // Convert PDF to images client-side
      const images = await pdfToImages(file);
      
      if (images.length === 0) {
        throw new Error("Failed to extract images from PDF");
      }

      setUploadProgress(40);

      // Get Firebase auth token
      const token = await user.getIdToken();

      setUploadProgress(50);

      // Send images to API
      const response = await fetch("/api/upload-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          images: images,
        }),
      });

      setUploadProgress(90);

      if (!response.ok) {
        // Try to parse as JSON, but handle HTML error pages
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const error = await response.json();
          const errorMsg = error.message || error.error || "Failed to upload and parse PDF";
          throw new Error(errorMsg);
        } else {
          // Server returned HTML (error page)
          const text = await response.text();
          console.error("Server error response:", text);
          throw new Error(`Server error (${response.status}): ${response.statusText}. Check server terminal for details.`);
        }
      }

      const result = await response.json();
      setUploadProgress(90);

      // Save to Firestore from client (has auth context)
      if (result.parsedData) {
        const { saveTest } = await import("@/lib/firebase/tests");
        await saveTest(user.uid, {
          testDate: new Date(result.parsedData.testDate),
          uploadedAt: new Date(),
          biomarkers: result.parsedData.biomarkers,
          source: "pdf_upload",
        });
      }

      setUploadProgress(100);

      setUploadStatus("success");
      toast({
        title: "Test uploaded successfully",
        description: `Extracted ${result.biomarkersCount} biomarkers from your test`,
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error.message || "Failed to upload PDF");
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload and parse PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Upload Blood Test PDF</CardTitle>
        <CardDescription>
          Upload your lab report PDF to extract biomarker data automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {uploadStatus === "success" ? (
            <div className="space-y-4">
              <CheckCircle2 className="h-12 w-12 text-accent mx-auto" />
              <p className="text-accent font-medium">Upload successful!</p>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-destructive font-medium">{errorMessage}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadStatus("idle");
                  setErrorMessage("");
                  fileInputRef.current?.click();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Processing PDF and extracting data...
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium mb-1">
                  Drag and drop your PDF here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF files up to 10MB
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                Select PDF File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <ToastDisplay toasts={toasts} />
    </Card>
  );
}
