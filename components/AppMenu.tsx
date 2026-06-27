'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { scrollToSection } from '../lib/scroll-section';

export type AppMenuVariant = 'paleo' | 'koine';

interface AppMenuProps {
  variant: AppMenuVariant;
}

type MenuItem =
  | { type: 'link'; label: string; href: string; external?: boolean }
  | { type: 'section'; label: string; id: string; basePath: string }
  | { type: 'divider' }
  | { type: 'badge'; label: string };

const APP_LINKS: MenuItem[] = [
  { type: 'link', label: 'paleoMem (OT)', href: '/' },
  { type: 'link', label: 'koineHydata (NT)', href: '/koine' },
];

const PALEO_SECTIONS: MenuItem[] = [
  { type: 'section', label: 'Insights', id: 'insights', basePath: '/' },
  { type: 'section', label: 'FAQ', id: 'faq', basePath: '/' },
  { type: 'section', label: 'Sources', id: 'datasources', basePath: '/' },
  { type: 'link', label: 'GitHub', href: 'https://github.com/brianmcconnel/paleoMem', external: true },
];

const KOINE_SECTIONS: MenuItem[] = [
  { type: 'section', label: 'Insights', id: 'insights', basePath: '/koine' },
  { type: 'section', label: 'FAQ', id: 'faq', basePath: '/koine' },
  { type: 'section', label: 'Sources', id: 'sources', basePath: '/koine' },
  { type: 'link', label: 'GitHub', href: 'https://github.com/brianmcconnel/paleoMem', external: true },
];

function buildMenuItems(variant: AppMenuVariant): MenuItem[] {
  const sections = variant === 'koine' ? KOINE_SECTIONS : PALEO_SECTIONS;
  const badge = variant === 'koine' ? 'New Testament' : 'Old Testament';

  return [
    { type: 'link', label: 'Settings', href: '/settings' },
    { type: 'divider' },
    ...APP_LINKS,
    ...sections,
    { type: 'divider' },
    { type: 'badge', label: badge },
  ];
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="w-5 h-5"
      aria-hidden
    >
      {open ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function AppMenu({ variant }: AppMenuProps) {
  const menuId = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = buildMenuItems(variant);
  const accentClass =
    variant === 'koine'
      ? 'hover:text-[var(--pw-accent)]'
      : 'hover:text-[var(--pw-accent-gold)]';

  const close = () => setOpen(false);

  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open]);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, basePath: string) => {
    const onSameApp =
      (basePath === '/' && (pathname === '/' || pathname === '')) ||
      (basePath === '/koine' && (pathname === '/koine' || pathname?.startsWith('/koine/')));

    if (onSameApp) {
      e.preventDefault();
      scrollToSection(id);
      window.history.replaceState(null, '', `#${id}`);
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg-surface)] text-[var(--pw-text-muted)] hover:text-[var(--pw-text)] hover:border-[var(--pw-border-strong)] transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <HamburgerIcon open={open} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[var(--pw-border)] bg-[var(--pw-bg-panel)] shadow-xl py-1.5 z-[60]"
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  role="separator"
                  className="my-1.5 border-t border-[var(--pw-border)]"
                />
              );
            }

            if (item.type === 'badge') {
              return (
                <div
                  key={item.label}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-[var(--pw-text-faint)]"
                >
                  {item.label}
                </div>
              );
            }

            if (item.type === 'section') {
              return (
                <Link
                  key={item.label}
                  href={`${item.basePath}#${item.id}`}
                  role="menuitem"
                  onClick={(e) => handleSectionClick(e, item.id, item.basePath)}
                  className={`block px-3 py-2 text-sm text-[var(--pw-text-soft)] ${accentClass} transition-colors`}
                >
                  {item.label}
                </Link>
              );
            }

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  onClick={close}
                  className={`block px-3 py-2 text-sm text-[var(--pw-text-soft)] ${accentClass} transition-colors`}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                onClick={close}
                className={`block px-3 py-2 text-sm text-[var(--pw-text-soft)] ${accentClass} transition-colors`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}