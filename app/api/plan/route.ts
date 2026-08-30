import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const groqApiKey = process.env.GROQ_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    // Check Groq API key
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is missing");

      return NextResponse.json(
        {
          error: "Server configuration error",
          detail: "GROQ_API_KEY is missing",
        },
        { status: 500 }
      );
    }

    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are a world-class corporate event planning expert.

A client described their event as:

"${query}"

Analyze the requirements and suggest the best fitting REAL venue.

Return data in this exact JSON structure:

{
  "venue_name": "Real specific venue name",
  "location": "City, State/Country",
  "estimated_cost": "$X,XXX - $X,XXX total",
  "why_it_fits": "2-3 sentences explaining why this venue matches the event."
}
`;

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },

        body: JSON.stringify({
          model: "openai/gpt-oss-20b",

          messages: [
            {
              role: "system",
              content:
                "You are a helpful event planning assistant. Always return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.7,

          // Better than max_tokens for newer Groq models
          max_completion_tokens: 1024,

          reasoning_effort: "low",

          // Force valid JSON
          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    // Read response as text first
    const responseText = await groqRes.text();

    console.log("Groq status:", groqRes.status);
    console.log("Groq response:", responseText);

    // If Groq API fails
    if (!groqRes.ok) {
      let groqError;

      try {
        groqError = JSON.parse(responseText);
      } catch {
        groqError = responseText;
      }

      console.error("Groq API error:", groqError);

      return NextResponse.json(
        {
          error: "Groq API failed",
          detail: groqError,
        },
        {
          status: groqRes.status,
        }
      );
    }

    const groqData = JSON.parse(responseText);

    const rawText =
      groqData?.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error(
        "Unexpected Groq response:",
        groqData
      );

      return NextResponse.json(
        {
          error: "Unexpected AI response",
          detail: groqData,
        },
        { status: 500 }
      );
    }

    let proposal;

    try {
      proposal = JSON.parse(rawText);
    } catch (error) {
      console.error(
        "Invalid JSON from AI:",
        rawText
      );

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          detail: rawText,
        },
        { status: 500 }
      );
    }

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("searches")
      .insert({
        user_query: query,
        venue_name: proposal.venue_name,
        location: proposal.location,
        estimated_cost: proposal.estimated_cost,
        why_it_fits: proposal.why_it_fits,
      });

    if (dbError) {
      console.error(
        "Supabase insert error:",
        dbError
      );
    }

    return NextResponse.json(proposal);

  } catch (error) {
    console.error("Server error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        detail:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("searches")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (error) {
      console.error(
        "Supabase fetch error:",
        error
      );

      return NextResponse.json(
        [],
        { status: 200 }
      );
    }

    return NextResponse.json(data || []);

  } catch (error) {
    console.error("GET error:", error);

    return NextResponse.json(
      [],
      { status: 200 }
    );
  }
}
