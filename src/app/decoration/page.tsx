import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
export const metadata = { title: 'Decoration — TheWeddingSpace' };
export default async function DecorationPage() {
  const supabase = await createClient();
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
