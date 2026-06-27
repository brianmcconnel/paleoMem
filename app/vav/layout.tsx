import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Vav',
  description:
    'Scripture cross-reference explorer — Treasury of Scripture Knowledge links across Old and New Testaments',
};

export default function VavLayout({ children }: { children: ReactNode }) {
  return children;
}