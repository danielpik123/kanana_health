import OpenAI from "openai";
import { ParsedTestData } from "@/types/test";
import { Biomarker } from "@/types/biomarker";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate biomarker status based on value and optimal range
 */
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

/**
 * Determine biomarker category based on name
 */
function determineCategory(name: string): Biomarker["category"] {
  const lowerName = name.toLowerCase();

  // Metabolic markers
  if (
    lowerName.includes("glucose") ||
    lowerName.includes("hba1c") ||
    lowerName.includes("insulin") ||
    lowerName.includes("triglyceride")
  ) {
    return "metabolic";
  }

  // Hormones
  if (
    lowerName.includes("testosterone") ||
    lowerName.includes("cortisol") ||
    lowerName.includes("tsh") ||
    lowerName.includes("t3") ||
    lowerName.includes("t4") ||
    lowerName.includes("estrogen") ||
    lowerName.includes("progesterone")
  ) {
    return "hormones";
  }

  // Nutrients
  if (
    lowerName.includes("vitamin") ||
    lowerName.includes("b12") ||
    lowerName.includes("folate") ||
    lowerName.includes("magnesium") ||
    lowerName.includes("zinc") ||
    lowerName.includes("iron")
  ) {
    return "nutrients";
  }

  // Cardiovascular
  if (
    lowerName.includes("cholesterol") ||
    lowerName.includes("ldl") ||
    lowerName.includes("hdl") ||
    lowerName.includes("apob") ||
    lowerName.includes("lipoprotein")
  ) {
    return "cardiovascular";
  }

  return "other";
}

/**
 * Get optimal range for a biomarker based on common medical standards
 * This is a fallback - ideally the PDF should contain reference ranges
 */
function getDefaultOptimalRange(
  name: string,
  unit: string
): { min: number; max: number } {
  const lowerName = name.toLowerCase();

  // Common reference ranges (these should ideally come from the PDF)
  const ranges: Record<string, { min: number; max: number }> = {
    "vitamin d": { min: 30, max: 100 }, // ng/mL
    "testosterone": { min: 400, max: 1000 }, // ng/dL (male)
    "ldl cholesterol": { min: 0, max: 100 }, // mg/dL
    "hdl cholesterol": { min: 40, max: 100 }, // mg/dL
    "hba1c": { min: 4.0, max: 5.6 }, // %
    "cortisol": { min: 10, max: 20 }, // µg/dL
    "tsh": { min: 0.4, max: 4.0 }, // mIU/L
    "magnesium": { min: 1.7, max: 2.2 }, // mg/dL
    "b12": { min: 200, max: 900 }, // pg/mL
    "triglycerides": { min: 0, max: 150 }, // mg/dL
  };

  for (const [key, range] of Object.entries(ranges)) {
    if (lowerName.includes(key)) {
      return range;
    }
  }

  // Default range if unknown
  return { min: 0, max: 1000 };
}

/**
 * Parse PDF images using GPT-4 Vision to extract biomarker data
 */
export async function parsePDFImages(
  images: Buffer[]
): Promise<ParsedTestData> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const systemPrompt = `You are an expert medical lab report parser. Your task is to extract biomarker test results from medical laboratory reports.

Extract the following information:
1. Test date (in any format - convert to YYYY-MM-DD)
2. All biomarkers with:
   - Name (exact as written)
   - Value (numeric)
   - Unit (e.g., mg/dL, ng/mL, %, etc.)
   - Reference/optimal range if available (min and max values)

The report may be in any language. Extract data accurately regardless of language.

Return a JSON object with this structure:
{
  "testDate": "YYYY-MM-DD",
  "biomarkers": [
    {
      "name": "Biomarker Name",
      "value": 123.45,
      "unit": "mg/dL",
      "optimalRange": {
        "min": 0,
        "max": 100
      }
    }
  ]
}

If reference ranges are not provided in the report, you may omit optimalRange and we'll use defaults.
Extract ALL biomarkers you can find in the report.`;

  // Convert images to base64
  const imageContents = images.map((image) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:image/png;base64,${image.toString("base64")}`,
    },
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all biomarker test results from this lab report. Return only valid JSON.",
            },
            ...imageContents,
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(responseContent) as {
      testDate: string;
      biomarkers: Array<{
        name?: string;
        value?: number;
        unit?: string;
        optimalRange?: { min: number; max: number };
      }>;
    };

    // Validate and process the data
    if (!parsed.testDate || !parsed.biomarkers || !Array.isArray(parsed.biomarkers)) {
      throw new Error("Invalid response format from OpenAI: missing testDate or biomarkers array");
    }

    // Parse date
    const testDate = new Date(parsed.testDate);
    if (isNaN(testDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Process biomarkers
    const biomarkers: Omit<Biomarker, "id" | "testDate" | "status">[] =
      parsed.biomarkers
        .filter((bio) => bio.name && bio.unit && typeof bio.value === "number") // Filter out invalid entries
        .map((bio) => {
          const optimalRange =
            bio.optimalRange ||
            getDefaultOptimalRange(bio.name || "", bio.unit || "");

          return {
            name: (bio.name || "").trim(),
            value: bio.value,
            unit: (bio.unit || "").trim(),
            optimalRange,
            category: determineCategory(bio.name || ""),
          };
        });

    if (biomarkers.length === 0) {
      throw new Error("No biomarkers found in the report");
    }

    return {
      testDate,
      biomarkers,
    };
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse response from AI. The PDF might be unclear or not a lab report.");
    }
    throw error;
  }
}

