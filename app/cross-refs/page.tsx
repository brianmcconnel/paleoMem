'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** @deprecated Use /vav */
export default function CrossRefsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vav');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[var(--pw-text-muted)]">
      Redirecting to Vav…
    </div>
  );
}