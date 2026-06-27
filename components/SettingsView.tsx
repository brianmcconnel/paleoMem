'use client';

import React from 'react';
import Link from 'next/link';
import { useHebrewFont } from './HebrewFontContext';
import { useTheme } from './ThemeContext';
import { useUserSettings } from './UserSettingsContext';
import type { HebrewFontMode, ThemeMode, VerseOnVisitMode } from '../lib/site-cookies';

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-[var(--pw-border)] last:border-b-0">
      <div className="min-w-0">
        <div className="font-medium text-[var(--pw-text)]">{title}</div>
        <p className="text-sm text-[var(--pw-text-muted)] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-surface)] p-0.5"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selected
                ? 'bg-[var(--pw-accent-gold)] text-[var(--pw-on-gold)]'
                : 'text-[var(--pw-text-muted)] hover:text-[var(--pw-text)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsView() {
  const { theme, setThemeMode } = useTheme();
  const { font: hebrewFont, setFontMode } = useHebrewFont();
  const { ready, showEmojis, setShowEmojisEnabled, verseOnVisit, setVerseOnVisitMode } =
    useUserSettings();

  if (!ready) {
    return (
      <div className="card p-6 text-sm text-[var(--pw-text-muted)]">Loading settings…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--pw-text)]">Settings</h1>
        <p className="text-sm text-[var(--pw-text-muted)] mt-1 leading-relaxed">
          Preferences are saved in your browser and apply across paleoMem and koineHydata.
        </p>
      </div>

      <div className="card px-4 sm:px-5">
        <SettingRow
          title="Theme"
          description="Light or dark appearance for the whole app."
        >
          <SegmentedControl<ThemeMode>
            ariaLabel="Color theme"
            value={theme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
            onChange={setThemeMode}
          />
        </SettingRow>

        <SettingRow
          title="Hebrew font"
          description="Modern pointed Hebrew (Noto) or consonant-only Paleo-Hebrew in the OT reader."
        >
          <SegmentedControl<HebrewFontMode>
            ariaLabel="Hebrew font"
            value={hebrewFont}
            options={[
              { value: 'modern', label: 'Modern' },
              { value: 'paleo', label: 'Paleo' },
            ]}
            onChange={setFontMode}
          />
        </SettingRow>

        <SettingRow
          title="Show emojis"
          description="Display pictograph emojis on Hebrew letter cards in the interlinear view."
        >
          <label className="toggle text-sm">
            <input
              type="checkbox"
              checked={showEmojis}
              onChange={(e) => setShowEmojisEnabled(e.target.checked)}
            />
            <span>{showEmojis ? 'On' : 'Off'}</span>
          </label>
        </SettingRow>

        <SettingRow
          title="Verse on visit"
          description="When you open paleoMem or koineHydata, resume your last verse or open a random one."
        >
          <SegmentedControl<VerseOnVisitMode>
            ariaLabel="Verse on visit"
            value={verseOnVisit}
            options={[
              { value: 'last', label: 'Last verse' },
              { value: 'random', label: 'Random' },
            ]}
            onChange={setVerseOnVisitMode}
          />
        </SettingRow>
      </div>

      <p className="text-xs text-[var(--pw-text-faint)]">
        <Link href="/" className="text-[var(--pw-link)] hover:underline">
          paleoMem
        </Link>
        {' · '}
        <Link href="/koine" className="text-[var(--pw-link)] hover:underline">
          koineHydata
        </Link>
      </p>
    </div>
  );
}