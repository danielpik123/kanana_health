import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { firstMessage } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!firstMessage || typeof firstMessage !== "string") {
      return NextResponse.json(
        { error: "First message is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful assistant that generates short, descriptive titles for chat conversations based on the first user message.

Rules:
1. Generate a title that is 3-5 words maximum
2. The title should capture the main topic or intent of the conversation
3. Keep it concise and clear
4. Use title case (capitalize important words)
5. Do not include quotation marks or punctuation
6. Focus on the health-related topic if it's about health, biomarkers, or wellness

Examples:
- "What does my vitamin D level mean?" → "Vitamin D Analysis"
- "How can I improve my cholesterol?" → "Cholesterol Improvement"
- "Explain my test results" → "Test Results Explanation"
- "What supplements should I take?" → "Supplement Recommendations"

Return only the title, nothing else.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate a title for this conversation based on the first message: "${firstMessage}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 20,
    });

    const title = completion.choices[0]?.message?.content?.trim() || "New Chat";

    // Clean up the title (remove quotes, extra spaces, etc.)
    const cleanTitle = title
      .replace(/^["']|["']$/g, "") // Remove surrounding quotes
      .trim();

    return NextResponse.json({ title: cleanTitle || "New Chat" });
  } catch (error: any) {
    console.error("Error generating conversation name:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate conversation name" },
      { status: 500 }
    );
  }
}

