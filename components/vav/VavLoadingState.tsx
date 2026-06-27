import React from 'react';

export const VAV_GRAPH_SURFACE_HEIGHT = 'h-[min(58vh,500px)] sm:h-[500px]';

type VavLoadingStateProps = {
  label?: string;
  variant?: 'page' | 'graph';
};

export function VavLoadingState({
  label = 'Loading…',
  variant = 'graph',
}: VavLoadingStateProps) {
  const spinner = (
    <div className="relative flex items-center justify-center w-14 h-14" aria-hidden>
      <span
        className="absolute inset-0 rounded-full border-2 border-[var(--pw-vav-accent)]/20 animate-spin"
        style={{ borderTopColor: 'var(--pw-vav-accent)' }}
      />
      <span
        className="absolute inset-1 rounded-full border border-[var(--pw-accent-gold)]/15 animate-spin"
        style={{
          borderBottomColor: 'var(--pw-accent-gold)',
          animationDirection: 'reverse',
          animationDuration: '1.4s',
        }}
      />
      <span className="scripture-hebrew text-xl text-[var(--pw-vav-accent)] animate-pulse">
        ו
      </span>
    </div>
  );

  if (variant === 'page') {
    return (
      <div
        className="card p-8 flex flex-col items-center justify-center gap-4 min-h-[240px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {spinner}
        <p className="text-sm text-[var(--pw-text-muted)]">{label}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl border border-[var(--pw-border)] overflow-hidden vav-graph-field ${VAV_GRAPH_SURFACE_HEIGHT} flex flex-col items-center justify-center gap-4`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {spinner}
      <p className="text-sm text-[var(--pw-text-muted)]">{label}</p>
    </div>
  );
}