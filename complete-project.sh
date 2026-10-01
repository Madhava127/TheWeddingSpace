#!/bin/bash
set -e
echo "======================================"
echo "  TheWeddingSpace — Full Completion"
echo "======================================"

# PHASE 0
echo ""
echo "[Phase 0] Preflight..."
[ -f package.json ] || { echo "Not in project root"; exit 1; }
[ -d src/app ] || { echo "Missing src/app"; exit 1; }
echo "OK"

# PHASE 1 — shadcn
echo ""
echo "[Phase 1] Installing shadcn components..."
npx shadcn@latest add -y -o input label textarea card dialog badge tabs skeleton sonner separator select alert-dialog checkbox avatar 2>&1 | tail -5 || echo "Some components may already exist"

# PHASE 2 — shared components
echo ""
echo "[Phase 2] Creating shared components..."
mkdir -p src/components/admin src/components/halls

cat > src/components/admin/ImageUploader.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { X, Upload, Loader2 } from 'lucide-react';

export default function ImageUploader({ bucket, value, onChange, multiple = true, maxFiles = 10 }: {
  bucket: string; value: string[]; onChange: (urls: string[]) => void; multiple?: boolean; maxFiles?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

  async function uploadFiles(files: FileList) {
    if (!multiple && files.length > 1) { toast.error('Only one image allowed'); return; }
    if (files.length > maxFiles - value.length) { toast.error('Max ' + maxFiles + ' images'); return; }
    setUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const path = Date.now() + '-' + file.name.replace(/\s+/g, '-');
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      onChange([...value, ...newUrls]);
      toast.success(newUrls.length + ' image(s) uploaded');
    } catch (e: any) { toast.error(e.message || 'Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-rose-100">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      {value.length < maxFiles && (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-rose-200 rounded-lg p-6 cursor-pointer hover:border-rose-400">
          {uploading ? <Loader2 className="animate-spin text-rose-500" /> : <Upload className="text-rose-500" />}
          <span className="text-sm text-rose-700">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
          <input type="file" accept="image/*" multiple={multiple} disabled={uploading}
            onChange={(e) => e.target.files && uploadFiles(e.target.files)} className="hidden" />
        </label>
      )}
    </div>
  );
}
EOF

cat > src/components/admin/DataTable.tsx << 'EOF'
'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

export default function DataTable({ columns, data, searchKeys = [], onRowClick, emptyMessage = 'No data', loading }: {
  columns: Column[]; data: any[]; searchKeys?: string[]; onRowClick?: (row: any) => void; emptyMessage?: string; loading?: boolean;
}) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let r = data;
    if (q && searchKeys.length) {
      const lq = q.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(lq)));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
      });
    }
    return r;
  }, [data, q, sortKey, sortDir, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search..."
            className="pl-8 pr-3 py-2 text-sm border border-rose-200 rounded-lg focus:border-rose-500 outline-none" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-rose-50">
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => { if (sortKey === c.key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); else { setSortKey(c.key); setSortDir('asc'); } }}
                  className="text-left px-4 py-3 font-medium text-rose-900 cursor-pointer select-none whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortKey === c.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={columns.length} className="px-4 py-3"><div className="h-4 bg-rose-100 rounded animate-pulse" /></td></tr>
            )) : current.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-12 text-rose-800/60">{emptyMessage}</td></tr>
            ) : current.map((row, i) => (
              <tr key={i} onClick={() => onRowClick?.(row)} className={'border-t border-rose-50 ' + (onRowClick ? 'cursor-pointer hover:bg-rose-50/50' : '')}>
                {columns.map((c) => <td key={c.key} className="px-4 py-3 text-rose-900">{c.render ? c.render(row) : row[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border border-rose-200 rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1 text-sm text-rose-800">Page {page} / {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border border-rose-200 rounded disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
EOF

echo "Shared components OK"

# PHASE 3 — public pages
echo ""
echo "[Phase 3] Creating public pages..."
mkdir -p src/app/about src/app/forgot-password src/app/contact src/app/catering src/app/decoration src/app/photography

cat > src/app/about/page.tsx << 'EOF'
import Link from 'next/link';
export const metadata = { title: 'About — TheWeddingSpace' };
const features = [
  { icon: '🏛️', title: 'Verified Venues', desc: 'Every hall is personally inspected and quality-checked before listing.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges. See hall rent, per-plate cost, and add-ons upfront.' },
  { icon: '✨', title: 'One-Stop Booking', desc: 'Hall, catering, decoration, and photography — all in a single flow.' },
  { icon: '🤝', title: 'Trusted Vendors', desc: 'Our partner chefs, decorators, and photographers are vetted professionals.' },
];
const stats = [
  { value: '500+', label: 'Weddings Hosted' },
  { value: '50+', label: 'Partner Venues' },
  { value: '10+', label: 'Cities' },
  { value: '4.9', label: 'Average Rating' },
];
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-rose-50/30">
      <section className="bg-gradient-to-b from-rose-100 to-rose-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-rose-900 mb-6">Making Weddings Effortless</h1>
          <p className="text-lg md:text-xl text-rose-800/80 max-w-2xl mx-auto leading-relaxed">TheWeddingSpace is India&apos;s simplest way to book a marriage hall, catering, decoration, and photography — all in one place.</p>
        </div>
      </section>
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-center text-rose-900 mb-12">Why TheWeddingSpace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-rose-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl text-rose-900 mb-2">{f.title}</h3>
                <p className="text-rose-800/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-rose-900 text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl md:text-5xl text-amber-400 mb-2">{s.value}</div>
              <div className="text-rose-100/80 text-sm uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-rose-900 mb-4">Ready to plan your big day?</h2>
        <Link href="/halls" className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium">Explore Venues</Link>
      </section>
    </main>
  );
}
EOF

cat > src/app/forgot-password/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(''); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: (process.env.NEXT_PUBLIC_SITE_URL || '') + '/login' });
    if (error) setError(error.message); else { setMessage('Check your email for a reset link.'); setEmail(''); }
    setLoading(false);
  }
  return (
    <main className="min-h-screen bg-rose-50/40 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
        <h1 className="font-serif text-3xl text-rose-900 mb-2">Reset Password</h1>
        <p className="text-rose-800/70 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:border-rose-500 outline-none" />
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          {message && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">{message}</div>}
          <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="text-center text-sm text-rose-800/70 mt-6">Remember? <Link href="/login" className="text-rose-600 hover:underline font-medium">Back to login</Link></p>
      </div>
    </main>
  );
}
EOF

cat > src/app/contact/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
export default function ContactPage() {
  const [settings, setSettings] = useState<any>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  useEffect(() => {
    supabase.from('site_settings').select('contact_email, contact_phone, address, instagram_url, facebook_url').eq('id', 1).maybeSingle()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.from('contact_enquiries').insert(form);
    if (error) toast.error(error.message); else { toast.success('Thanks! We will get back to you soon.'); setForm({ name: '', email: '', phone: '', message: '' }); }
    setLoading(false);
  }
  return (
    <main className="min-h-screen bg-rose-50/40 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-rose-900 mb-4">Get in Touch</h1>
          <p className="text-rose-800/70 max-w-xl mx-auto">Have a question about a venue or your booking? We&apos;d love to hear from you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
            <h2 className="font-serif text-2xl text-rose-900 mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(['name', 'email', 'phone'] as const).map((f) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-rose-900 mb-1 capitalize">{f}</label>
                  <input type={f === 'email' ? 'email' : 'text'} required={f !== 'phone'} value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:border-rose-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-rose-900 mb-1">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-rose-200 focus:border-rose-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8">
            <h2 className="font-serif text-2xl text-rose-900 mb-6">Contact Info</h2>
            <div className="space-y-6 text-rose-800/80">
              {settings.contact_email && <div><div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Email</div><a href={'mailto:' + settings.contact_email} className="hover:text-rose-600">{settings.contact_email}</a></div>}
              {settings.contact_phone && <div><div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Phone</div><a href={'tel:' + settings.contact_phone} className="hover:text-rose-600">{settings.contact_phone}</a></div>}
              {settings.address && <div><div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Address</div><div className="whitespace-pre-line">{settings.address}</div></div>}
              {!settings.contact_email && !settings.contact_phone && <p className="text-rose-800/60 text-sm">Contact details will appear here once set in the admin panel.</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
EOF

cat > src/app/catering/page.tsx << 'EOF'
import { createServerClient } from '@/lib/supabase/server';
export const metadata = { title: 'Catering — TheWeddingSpace' };
export default async function CateringPage() {
  const supabase = await createServerClient();
  const [{ data: cats }, { data: items }] = await Promise.all([
    supabase.from('food_categories').select('*').order('sort_order'),
    supabase.from('food_items').select('*').eq('is_active', true),
  ]);
  const categories = cats || [];
  const foods = items || [];
  return (
    <main className="min-h-screen bg-rose-50/30 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-rose-900 mb-4">Catering Menus</h1>
          <p className="text-rose-800/70 max-w-xl mx-auto">Delicious multi-cuisine menus prepared by our partner chefs. Prices are per plate.</p>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-20 text-rose-800/60"><p>No catering items available yet.</p></div>
        ) : categories.map((cat) => {
          const catItems = foods.filter((i: any) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2 className="font-serif text-3xl text-rose-900 mb-6">{cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-rose-900">{item.name}</h3>
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (item.is_veg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <p className="text-rose-800/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-rose-50">
                      <span className="text-rose-900 font-semibold">₹{Number(item.price_per_plate).toLocaleString('en-IN')}<span className="text-xs text-rose-800/60 font-normal"> / plate</span></span>
                      {item.cuisine && <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{item.cuisine}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
EOF

cat > src/app/decoration/page.tsx << 'EOF'
import { createServerClient } from '@/lib/supabase/server';
import Image from 'next/image';
export const metadata = { title: 'Decoration — TheWeddingSpace' };
export default async function DecorationPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('decoration_packages').select('*').eq('is_active', true);
  const packages = data || [];
  return (
    <main className="min-h-screen bg-rose-50/30 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-rose-900 mb-4">Decoration Packages</h1>
          <p className="text-rose-800/70 max-w-xl mx-auto">Transform your venue with our curated decoration themes.</p>
        </div>
        {packages.length === 0 ? (
          <div className="text-center py-20 text-rose-800/60"><p>No decoration packages available yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-md group">
                <div className="relative aspect-[4/3] bg-rose-100">
                  {pkg.cover_image ? <Image src={pkg.cover_image} alt={pkg.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full bg-gradient-to-br from-rose-200 to-amber-100" />}
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl text-rose-900 mb-2">{pkg.name}</h3>
                  <p className="text-rose-800/70 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                  <ul className="text-sm text-rose-800/80 space-y-1 mb-4">
                    {(pkg.includes || []).slice(0, 3).map((inc: string, i: number) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-rose-500">✓</span> {inc}</li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-rose-50"><span className="text-rose-900 font-semibold">₹{Number(pkg.price).toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
EOF

cat > src/app/photography/page.tsx << 'EOF'
import { createServerClient } from '@/lib/supabase/server';
import Image from 'next/image';
export const metadata = { title: 'Photography — TheWeddingSpace' };
export default async function PhotographyPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.from('photography_packages').select('*').eq('is_active', true);
  const packages = data || [];
  return (
    <main className="min-h-screen bg-rose-50/30 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-rose-900 mb-4">Photography Packages</h1>
          <p className="text-rose-800/70 max-w-xl mx-auto">Capture every moment of your special day with our expert photographers.</p>
        </div>
        {packages.length === 0 ? (
          <div className="text-center py-20 text-rose-800/60"><p>No photography packages available yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg: any) => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-md group">
                <div className="relative aspect-[4/3] bg-rose-100">
                  {pkg.cover_image ? <Image src={pkg.cover_image} alt={pkg.name} fill sizes="33vw" className="object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full bg-gradient-to-br from-rose-200 to-amber-100" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-xl text-rose-900">{pkg.name}</h3>
                    {pkg.duration_hours && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{pkg.duration_hours}h</span>}
                  </div>
                  <p className="text-rose-800/70 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                  <ul className="text-sm text-rose-800/80 space-y-1 mb-4">
                    {(pkg.features || []).slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-rose-500">✓</span> {f}</li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-rose-50"><span className="text-rose-900 font-semibold">₹{Number(pkg.price).toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
EOF

echo "Public pages OK"

# PHASE 4 — admin pages
echo ""
echo "[Phase 4] Creating admin pages..."
mkdir -p src/app/admin/halls/new "src/app/admin/halls/[id]/edit" src/app/admin/food src/app/admin/decoration src/app/admin/photography src/app/admin/payments src/app/admin/settings

cat > src/app/admin/halls/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '@/components/admin/DataTable';
export default function AdminHallsPage() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from('halls').select('*').order('created_at', { ascending: false });
    setHalls(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function toggleActive(id: string, val: boolean) {
    await supabase.from('halls').update({ is_active: val }).eq('id', id);
    toast.success(val ? 'Activated' : 'Deactivated'); load();
  }
  async function handleDelete(id: string) {
    if (!confirm('Delete this hall?')) return;
    const { error } = await supabase.from('halls').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  }
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'city', label: 'City' },
    { key: 'capacity_max', label: 'Capacity' },
    { key: 'base_price', label: 'Base ₹', render: (r: any) => '₹' + Number(r.base_price).toLocaleString('en-IN') },
    { key: 'price_per_plate_veg', label: 'Veg ₹', render: (r: any) => '₹' + Number(r.price_per_plate_veg || 0).toLocaleString('en-IN') },
    { key: 'price_per_plate_nonveg', label: 'NonVeg ₹', render: (r: any) => '₹' + Number(r.price_per_plate_nonveg || 0).toLocaleString('en-IN') },
    { key: 'is_active', label: 'Active', render: (r: any) => <input type="checkbox" checked={r.is_active} onChange={(e) => toggleActive(r.id, e.target.checked)} /> },
    { key: 'actions', label: '', render: (r: any) => (
      <div className="flex gap-2">
        <Link href={'/admin/halls/' + r.id + '/edit'} className="text-rose-600"><Pencil size={16} /></Link>
        <button onClick={() => handleDelete(r.id)} className="text-red-500"><Trash2 size={16} /></button>
      </div>
    ) },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-rose-900">Halls</h1>
        <Link href="/admin/halls/new" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Hall</Link>
      </div>
      <DataTable columns={columns} data={halls} searchKeys={['name', 'city']} loading={loading} emptyMessage="No halls yet." />
    </div>
  );
}
EOF

cat > src/components/admin/HallForm.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import ImageUploader from '@/components/admin/ImageUploader';
const AMENITIES = ['AC', 'Parking', 'Bridal Room', 'DJ', 'Generator', 'Kitchen', 'Valet', 'Wi-Fi'];
export default function HallForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const [form, setForm] = useState({
    name: initial?.name || '', slug: initial?.slug || '', description: initial?.description || '',
    address: initial?.address || '', city: initial?.city || '', state: initial?.state || '', pincode: initial?.pincode || '',
    capacity_min: initial?.capacity_min || 100, capacity_max: initial?.capacity_max || 500,
    base_price: initial?.base_price || 50000, price_per_plate_veg: initial?.price_per_plate_veg || 500,
    price_per_plate_nonveg: initial?.price_per_plate_nonveg || 700, advance_percent: initial?.advance_percent || 20,
    is_active: initial?.is_active ?? true,
  });
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities || []);
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [saving, setSaving] = useState(false);
  function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function update(k: string, v: any) { setForm((f) => ({ ...f, [k]: v })); if (k === 'name' && !initial) setForm((f) => ({ ...f, slug: slugify(v) })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = { ...form, amenities, images, cover_image: images[0] || null };
    const op = initial ? supabase.from('halls').update(payload).eq('id', initial.id) : supabase.from('halls').insert(payload);
    const { error } = await op;
    if (error) toast.error(error.message); else { toast.success(initial ? 'Updated' : 'Created'); router.push('/admin/halls'); }
    setSaving(false);
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-4">
        <h2 className="font-serif text-xl text-rose-900">Basic Info</h2>
        <input required placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-4 py-2 border border-rose-200 rounded-lg" />
        <input placeholder="Slug" value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full px-4 py-2 border border-rose-200 rounded-lg" />
        <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-4 py-2 border border-rose-200 rounded-lg resize-none" />
      </div>
      <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-4">
        <h2 className="font-serif text-xl text-rose-900">Location</h2>
        <input placeholder="Address" value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full px-4 py-2 border border-rose-200 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          <input placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input placeholder="State" value={form.state} onChange={(e) => update('state', e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input placeholder="Pincode" value={form.pincode} onChange={(e) => update('pincode', e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-rose-100 p-6 space-y-4">
        <h2 className="font-serif text-xl text-rose-900">Capacity & Pricing</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input type="number" placeholder="Min cap" value={form.capacity_min} onChange={(e) => update('capacity_min', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input type="number" placeholder="Max cap" value={form.capacity_max} onChange={(e) => update('capacity_max', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input type="number" placeholder="Base ₹" value={form.base_price} onChange={(e) => update('base_price', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input type="number" placeholder="Advance %" value={form.advance_percent} onChange={(e) => update('advance_percent', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input type="number" placeholder="Veg ₹/plate" value={form.price_per_plate_veg} onChange={(e) => update('price_per_plate_veg', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
          <input type="number" placeholder="NonVeg ₹/plate" value={form.price_per_plate_nonveg} onChange={(e) => update('price_per_plate_nonveg', +e.target.value)} className="px-4 py-2 border border-rose-200 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-rose-100 p-6">
        <h2 className="font-serif text-xl text-rose-900 mb-3">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button type="button" key={a} onClick={() => setAmenities(amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a])}
              className={'px-3 py-1.5 rounded-full text-sm border ' + (amenities.includes(a) ? 'bg-rose-600 text-white border-rose-600' : 'border-rose-200 text-rose-800')}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-rose-100 p-6">
        <h2 className="font-serif text-xl text-rose-900 mb-3">Images</h2>
        <ImageUploader bucket="hall-images" value={images} onChange={setImages} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.push('/admin/halls')} className="px-5 py-2 border border-rose-200 rounded-lg text-rose-800">Cancel</button>
        <button type="submit" disabled={saving} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium">
          {saving ? 'Saving...' : (initial ? 'Update Hall' : 'Create Hall')}
        </button>
      </div>
    </form>
  );
}
EOF

cat > src/app/admin/halls/new/page.tsx << 'EOF'
import HallForm from '@/components/admin/HallForm';
export default function NewHallPage() {
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Add Hall</h1><HallForm /></div>);
}
EOF

cat > "src/app/admin/halls/[id]/edit/page.tsx" << 'EOF'
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import HallForm from '@/components/admin/HallForm';
export default async function EditHallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.from('halls').select('*').eq('id', id).single();
  if (!data) notFound();
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Edit Hall</h1><HallForm initial={data} /></div>);
}
EOF

cat > src/app/admin/food/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
export default function AdminFoodPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function load() {
    setLoading(true);
    const [{ data: i }, { data: c }] = await Promise.all([
      supabase.from('food_items').select('*').order('created_at', { ascending: false }),
      supabase.from('food_categories').select('*').order('sort_order'),
    ]);
    setItems(i || []); setCats(c || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function updatePrice(id: string, price: number) {
    await supabase.from('food_items').update({ price_per_plate: price }).eq('id', id);
    toast.success('Price updated'); load();
  }
  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('food_items').delete().eq('id', id); toast.success('Deleted'); load();
  }
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category_id', label: 'Category', render: (r: any) => cats.find((c) => c.id === r.category_id)?.name || '—' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'is_veg', label: 'Type', render: (r: any) => r.is_veg ? '🟢 Veg' : '🔴 Non-Veg' },
    { key: 'price_per_plate', label: '₹ / plate', render: (r: any) => (
      <input type="number" defaultValue={r.price_per_plate}
        onBlur={(e) => { const v = Number(e.target.value); if (v !== r.price_per_plate) updatePrice(r.id, v); }}
        className="w-24 px-2 py-1 border border-rose-200 rounded text-sm" />
    ) },
    { key: 'actions', label: '', render: (r: any) => <button onClick={() => handleDelete(r.id)} className="text-red-500"><Trash2 size={16} /></button> },
  ];
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Food & Catering</h1>
    <DataTable columns={columns} data={items} searchKeys={['name', 'cuisine']} loading={loading} emptyMessage="No food items yet." /></div>);
}
EOF

cat > src/app/admin/decoration/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
export default function AdminDecorationPage() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from('decoration_packages').select('*').order('created_at', { ascending: false });
    setPkgs(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('decoration_packages').delete().eq('id', id); toast.success('Deleted'); load();
  }
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Decoration Packages</h1>
    {loading ? <p>Loading...</p> : pkgs.length === 0 ? <p className="text-rose-800/60">No packages yet.</p> : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pkgs.map((p) => (<div key={p.id} className="bg-white rounded-2xl border border-rose-100 p-4">
          <h3 className="font-serif text-lg text-rose-900">{p.name}</h3>
          <p className="text-sm text-rose-800/70 mt-1 mb-3 line-clamp-2">{p.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-rose-900 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</span>
            <button onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        </div>))}
      </div>
    )}</div>);
}
EOF

cat > src/app/admin/photography/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
export default function AdminPhotographyPage() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from('photography_packages').select('*').order('created_at', { ascending: false });
    setPkgs(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function handleDelete(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('photography_packages').delete().eq('id', id); toast.success('Deleted'); load();
  }
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Photography Packages</h1>
    {loading ? <p>Loading...</p> : pkgs.length === 0 ? <p className="text-rose-800/60">No packages yet.</p> : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pkgs.map((p) => (<div key={p.id} className="bg-white rounded-2xl border border-rose-100 p-4">
          <h3 className="font-serif text-lg text-rose-900">{p.name}</h3>
          <p className="text-sm text-rose-800/70 mt-1 mb-3 line-clamp-2">{p.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-rose-900 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</span>
            <button onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 size={16} /></button>
          </div>
        </div>))}
      </div>
    )}</div>);
}
EOF

cat > src/app/admin/payments/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import DataTable from '@/components/admin/DataTable';
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  useEffect(() => {
    supabase.from('payments').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data || []); setLoading(false); });
  }, []);
  const columns = [
    { key: 'booking_id', label: 'Booking', render: (r: any) => String(r.booking_id).slice(0, 8) + '…' },
    { key: 'razorpay_order_id', label: 'Order ID' },
    { key: 'razorpay_payment_id', label: 'Payment ID' },
    { key: 'amount', label: 'Amount', render: (r: any) => '₹' + Number(r.amount).toLocaleString('en-IN') },
    { key: 'currency', label: 'Cur' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleString('en-IN') },
  ];
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Payments</h1>
    <DataTable columns={columns} data={payments} searchKeys={['razorpay_order_id', 'razorpay_payment_id', 'status']} loading={loading} emptyMessage="No payments yet." /></div>);
}
EOF

cat > src/app/admin/settings/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
export default function AdminSettingsPage() {
  const [form, setForm] = useState<any>({ gst_percent: 18, default_advance_percent: 20, contact_email: '', contact_phone: '', address: '', instagram_url: '', facebook_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => { if (data) setForm(data); setLoading(false); });
  }, []);
  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('site_settings').update(form).eq('id', 1);
    if (error) toast.error(error.message); else toast.success('Saved');
    setSaving(false);
  }
  if (loading) return <p>Loading...</p>;
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Site Settings</h1>
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-rose-100 p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <label className="block"><span className="text-sm text-rose-900">GST %</span>
          <input type="number" value={form.gst_percent} onChange={(e) => setForm({ ...form, gst_percent: +e.target.value })} className="w-full mt-1 px-3 py-2 border border-rose-200 rounded-lg" /></label>
        <label className="block"><span className="text-sm text-rose-900">Advance %</span>
          <input type="number" value={form.default_advance_percent} onChange={(e) => setForm({ ...form, default_advance_percent: +e.target.value })} className="w-full mt-1 px-3 py-2 border border-rose-200 rounded-lg" /></label>
      </div>
      {['contact_email', 'contact_phone', 'address', 'instagram_url', 'facebook_url'].map((f) => (
        <label key={f} className="block"><span className="text-sm text-rose-900 capitalize">{f.replace('_', ' ')}</span>
          <input value={form[f] || ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="w-full mt-1 px-3 py-2 border border-rose-200 rounded-lg" /></label>
      ))}
      <button type="submit" disabled={saving} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium">{saving ? 'Saving...' : 'Save Settings'}</button>
    </form></div>);
}
EOF

echo "Admin pages OK"

# PHASE 5 — build, commit, push
echo ""
echo "[Phase 5] Building..."
npm run build 2>&1 | tail -30
BUILD_STATUS=${PIPESTATUS[0]}

if [ $BUILD_STATUS -ne 0 ]; then
  echo ""
  echo "Build failed. Fix errors above, then run:"
  echo "  git add . && git commit -m 'feat: complete pages' && git push"
  exit 1
fi

echo ""
echo "Build succeeded"
echo ""
echo "[Phase 5] Committing and pushing..."
git add .
git commit -m "feat: complete public pages, admin CRUD, and shared components" || echo "Nothing to commit"
git push || echo "Push failed"

echo ""
echo "======================================"
echo "  DONE"
echo "======================================"
echo ""
echo "Vercel will auto-deploy in ~2 minutes."
echo "Test:"
echo "  https://the-wedding-space.vercel.app/catering"
echo "  https://the-wedding-space.vercel.app/decoration"
echo "  https://the-wedding-space.vercel.app/photography"
echo "  https://the-wedding-space.vercel.app/about"
echo "  https://the-wedding-space.vercel.app/contact"
echo "  https://the-wedding-space.vercel.app/admin/halls"
echo ""
