import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const prompt = `You are a world-class corporate event planning expert with deep knowledge of venues globally.

A client described their event as: "${query}"

Analyze their requirements (number of people, location preference, duration, budget, type of event) and suggest the BEST fitting real venue.

Return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text — just the raw JSON:
{
  "venue_name": "Real specific venue name",
  "location": "City, State/Country",
  "estimated_cost": "$X,XXX - $X,XXX total",
  "why_it_fits": "2-3 sentences explaining exactly why this venue matches their specific needs, mentioning relevant features like capacity, amenities, setting, and value for budget."
}`;

    const callGroq = () => fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only API. You never respond with markdown, explanations, or any text outside of a single valid JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        reasoning_effort: 'low'
      })
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let groqRes: Response | null = null;
    let lastErr = '';
    const MAX_ATTEMPTS = 3;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      groqRes = await callGroq();

      if (groqRes.ok) break;

      lastErr = await groqRes.text();
      console.warn(`Groq API attempt ${attempt} failed:`, lastErr);

      if (attempt < MAX_ATTEMPTS) {
        await sleep(300 * attempt); // small increasing backoff: 300ms, 600ms
      }
    }

    if (!groqRes || !groqRes.ok) {
      console.error('Groq API error after retries:', lastErr);
      return NextResponse.json({ error: 'Groq API failed', detail: lastErr }, { status: 500 });
    }

    const groqData = await groqRes.json();
    const rawText = groqData?.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error('Unexpected Groq response shape:', JSON.stringify(groqData));
      return NextResponse.json({ error: 'Unexpected AI response', detail: groqData }, { status: 500 });
    }

    // Strip any accidental markdown backticks
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let proposal;
    try {
      proposal = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw AI output:', rawText);
      return NextResponse.json({ error: 'AI returned invalid JSON', detail: rawText }, { status: 500 });
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from('searches').insert({
      user_query: query,
      venue_name: proposal.venue_name,
      location: proposal.location,
      estimated_cost: proposal.estimated_cost,
      why_it_fits: proposal.why_it_fits
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
    }

    return NextResponse.json(proposal);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('searches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
