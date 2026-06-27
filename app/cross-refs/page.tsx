'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Header } from '../../components/Header';

const CrossRefExplorer = dynamic(
  () =>
    import('../../components/cross-refs/CrossRefExplorer').then((m) => m.CrossRefExplorer),
  {
    ssr: false,
    loading: () => (
      <div className="card p-6 text-sm text-[var(--pw-text-muted)]">Loading cross-references…</div>
    ),
  },
);

export default function CrossRefsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-6 sm:py-8 w-full">
        <CrossRefExplorer />
      </main>
    </div>
  );
}