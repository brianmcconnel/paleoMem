'use client';

import React from 'react';
import { Header } from '../../components/Header';
import { SettingsView } from '../../components/SettingsView';

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-6 py-6 sm:py-8 w-full">
        <SettingsView />
      </main>
    </div>
  );
}