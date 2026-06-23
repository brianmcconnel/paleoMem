import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  ref: z.string(),
  hebrew: z.string(),
  kjv: z.string().optional(),
});

/**
 * POST /api/summary
 * Stub for AI-powered pictograph + verse insight.
 *
 * To enable real calls:
 *   - Add OPENAI_API_KEY or XAI_API_KEY to .env.local
 *   - Replace the mock with real fetch to the model of your choice.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const { ref, kjv } = parsed.data;

    // TODO: Replace with real AI call.
    // Example using xAI or OpenAI:
    // const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
    // ... fetch to https://api.x.ai/v1 or https://api.openai.com ...

    // For now return a high-quality deterministic placeholder.
    // The client will also show a fallback if fetch fails.

    const mockSummary =
      `Pictographic reading of ${ref}:\n\n` +
      `KJV: “${kjv ?? ''}”\n\n` +
      `The verse opens with בראשית — "In the head of the house" or "At the first strength". ` +
      `The Bet (🏠 house) + Resh (👤 head) together paint the idea of foremost authority and origin. ` +
      `ברא (created) carries the power of Aleph-Bet-Resh: strength entering the house. ` +
      `אלהים (Elohim) — Aleph-Lamed-He-Yod-Mem — strength (ox) + authority (staff) + revelation (window) + hand + waters/chaos contained. ` +
      `The act of creating the heavens (שמים) and earth (ארץ) shows the divine ordering of chaos into covenant space.\n\n` +
      `This is the foundation: God as the first and strongest who brings order by His word.`;

    // Simulate slight delay for realism
    await new Promise(r => setTimeout(r, 280));

    return NextResponse.json({
      ref,
      summary: mockSummary,
      model: 'stub-deterministic',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
