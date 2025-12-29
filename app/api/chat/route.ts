import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, userId, userTestData } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Use test data sent from client (has auth context)
    let biomarkerSummary = "No biomarker data available yet.";
    let testDateInfo = "";

    if (userTestData && userTestData.latestTest) {
      const latestTest = userTestData.latestTest;
      const testDate = latestTest.testDate instanceof Date
        ? latestTest.testDate
        : (latestTest.testDate as any).toDate?.() || new Date(latestTest.testDate);
      
      testDateInfo = `Latest test date: ${testDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`;

      if (latestTest.biomarkers && latestTest.biomarkers.length > 0) {
        biomarkerSummary = latestTest.biomarkers
          .map((b: any) => `${b.name}: ${b.value} ${b.unit} (${b.status})`)
          .join(", ");
      }
    }

    // Build system prompt with real user data
    const systemPrompt = `You are a Kavana Health Specialist, an expert in health optimization, biomarker interpretation, and personalized wellness strategies. 

User's Health Data:
${testDateInfo ? `- ${testDateInfo}\n` : ""}${biomarkerSummary !== "No biomarker data available yet." ? `- Recent Biomarkers: ${biomarkerSummary}` : "- No biomarker tests uploaded yet. Encourage the user to upload their blood test PDFs."}

Your role is to:
1. Interpret biomarker data in the context of optimal health
2. Provide evidence-based recommendations for health optimization
3. Explain complex health concepts in clear, actionable terms
4. Suggest lifestyle, nutrition, and supplementation strategies
5. Help users understand their health data and make informed decisions
6. Reference specific biomarkers by name when discussing results
7. If no test data is available, guide users on what tests to get and how to upload them

Always be professional, empathetic, and focus on actionable insights. Reference specific biomarkers when relevant.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ message: response });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}

