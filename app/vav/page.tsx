'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { VavHeader } from '../../components/vav/VavHeader';
import { VavLoadingState } from '../../components/vav/VavLoadingState';

const CrossRefExplorer = dynamic(
  () =>
    import('../../components/cross-refs/CrossRefExplorer').then((m) => m.CrossRefExplorer),
  {
    ssr: false,
    loading: () => <VavLoadingState variant="page" label="Loading Vav…" />,
  },
);

export default function VavPage() {
  return (
    <div className="min-h-screen flex flex-col vav-page">
      <VavHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 w-full">
        <CrossRefExplorer />
      </main>
    </div>
  );
}