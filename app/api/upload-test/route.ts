import { NextRequest, NextResponse } from "next/server";
import { parsePDFImages } from "@/lib/openai/pdfParser";
import { saveTest } from "@/lib/firebase/tests";
import { Biomarker } from "@/types/biomarker";

function calculateStatus(
  value: number,
  optimalRange: { min: number; max: number }
): Biomarker["status"] {
  if (value >= optimalRange.min && value <= optimalRange.max) {
    return "optimal";
  } else if (
    value < optimalRange.min * 0.7 ||
    value > optimalRange.max * 1.3
  ) {
    return "danger";
  } else {
    return "sub-optimal";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json();
    const { images, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - User ID required" },
        { status: 401 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Convert base64 images to Buffers
    const imageBuffers: Buffer[] = images.map((base64Image: string) => {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = base64Image.includes(",")
        ? base64Image.split(",")[1]
        : base64Image;
      return Buffer.from(base64Data, "base64");
    });

    // Parse images with GPT-4 Vision
    const parsedData = await parsePDFImages(imageBuffers);

    // Calculate status for each biomarker
    const biomarkers: Biomarker[] = parsedData.biomarkers.map((bio, index) => {
      const status = calculateStatus(bio.value, bio.optimalRange);
      return {
        id: `bio-${Date.now()}-${index}`,
        ...bio,
        status,
        testDate: parsedData.testDate,
      };
    });

    // Return parsed data - client will save to Firestore (has auth context)
    return NextResponse.json({
      success: true,
      parsedData: {
        testDate: parsedData.testDate.toISOString(),
        biomarkers: biomarkers.map(bio => ({
          ...bio,
          testDate: parsedData.testDate.toISOString(),
        })),
      },
      biomarkersCount: biomarkers.length,
    });
  } catch (error: any) {
    console.error("Upload test error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process PDF",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
