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
