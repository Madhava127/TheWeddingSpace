#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "=== Step 1: Creating RequireAuth component ==="
mkdir -p src/components/auth

cat > src/components/auth/RequireAuth.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        const redirect = pathname + window.location.search;
        router.replace('/login?redirect=' + encodeURIComponent(redirect));
      } else {
        setReady(true);
      }
    });
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600 mx-auto mb-4" />
          <p className="text-rose-800/70">Checking your login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
EOF
echo "OK"

echo "=== Step 2: Wrapping /book page ==="
if [ -f src/app/book/page.tsx ]; then
  cp src/app/book/page.tsx src/app/book/page.tsx.bak
  cat > src/app/book/page.tsx << 'EOF'
'use client';
import { Suspense } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import BookingWizard from '@/components/booking/BookingWizard';

export default function BookPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <BookingWizard />
      </Suspense>
    </RequireAuth>
  );
}
EOF
  echo "Wrapped /book/page.tsx (backup saved as .bak)"
else
  echo "WARN: src/app/book/page.tsx not found — creating minimal wrapper"
  mkdir -p src/app/book
  cat > src/app/book/page.tsx << 'EOF'
'use client';
import { Suspense } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import BookingWizard from '@/components/booking/BookingWizard';

export default function BookPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
        <BookingWizard />
      </Suspense>
    </RequireAuth>
  );
}
EOF
fi

echo "=== Step 3: Updating login page to honor ?redirect= ==="
if [ -f src/app/login/page.tsx ]; then
  cp src/app/login/page.tsx src/app/login/page.tsx.bak
  # Replace router.push('/dashboard') and router.push('/') with redirect-aware version
  sed -i '' "s|router\.push(['\"]/dashboard['\"])|router.push(new URLSearchParams(window.location.search).get('redirect') \|\| '/dashboard')|g" src/app/login/page.tsx
  sed -i '' "s|router\.push(['\"]/['\"])|router.push(new URLSearchParams(window.location.search).get('redirect') \|\| '/')|g" src/app/login/page.tsx
  # Also handle router.replace variants
  sed -i '' "s|router\.replace(['\"]/dashboard['\"])|router.replace(new URLSearchParams(window.location.search).get('redirect') \|\| '/dashboard')|g" src/app/login/page.tsx
  echo "Login page updated (backup saved as .bak)"
else
  echo "WARN: login page not found — skipping"
fi

echo "=== Step 4: Building ==="
npm run build 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo ""
  echo "❌ Build failed. Check errors above."
  echo "   Backups: src/app/book/page.tsx.bak, src/app/login/page.tsx.bak"
  echo "   Restore with: cp src/app/book/page.tsx.bak src/app/book/page.tsx"
  exit 1
fi

echo ""
echo "=== Step 5: Committing and pushing ==="
git add .
git commit -m "feat: require login before booking + redirect back after login" || echo "Nothing new to commit"
git push || echo "Push failed — check remote"

echo ""
echo "======================================"
echo "  ✓ DONE"
echo "======================================"
echo ""
echo "NEXT: Run the SQL in Supabase (see message below)"
echo "Then wait 2 min for Vercel to deploy"
