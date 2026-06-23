'use client';

import React, { useState } from 'react';
import { ScriptureVerse } from '../data/verses';

interface AISummaryProps {
  verse: ScriptureVerse;
}

export function AISummary({ verse }: AISummaryProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: verse.ref,
          hebrew: verse.hebrew,
          kjv: verse.kjv,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setSummary(data.summary || 'No summary returned.');
    } catch {
      setError('AI summary temporarily unavailable. (Add your key in /api/summary later.)');
      // Fallback demo content
      setSummary(
        `In ${verse.ref} (“${verse.kjv}”), the pictographs reveal themes of beginnings, strength, and creative order. ` +
          `The first word בְּרֵאשִׁית begins with Bet (house) + Resh (head) — pointing to the "head of the house" or "in the head/foremost". ` +
          `Elohim (אלהים) carries strength and plurality in unity.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="font-semibold">AI Insight</div>
          <div className="text-xs text-[var(--pw-text-muted)]">
            xAI / OpenAI powered summary + pictograph correlations
          </div>
        </div>
        <button onClick={fetchSummary} disabled={loading} className="btn btn-gold text-sm">
          {loading ? 'Thinking…' : 'Generate Insight'}
        </button>
      </div>

      {summary && (
        <div className="prose prose-invert prose-sm text-[var(--pw-text-soft)] bg-[var(--pw-bg-elevated)] p-4 rounded-lg border border-[var(--pw-border)]">
          {summary}
        </div>
      )}
      {error && <div className="text-xs text-amber-400 mt-2">{error}</div>}
      {!summary && !error && (
        <p className="text-sm text-[var(--pw-text-muted)]">
          Click “Generate Insight” for a contextual summary combining the verse text and the letter
          pictographs.
        </p>
      )}
    </div>
  );
}
