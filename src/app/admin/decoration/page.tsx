'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

export default function AdminDecorationPage() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [includesText, setIncludesText] = useState('');
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('decoration_packages').select('*').order('created_at', { ascending: false });
    setPkgs(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(p: any) {
    setEditing({ ...p }); setIsNew(false);
    setIncludesText((p.includes || []).join('\n'));
  }
  function openNew() {
    setEditing({ name: '', description: '', price: 0, includes: [], is_active: true });
    setIsNew(true); setIncludesText('');
  }

  async function save() {
    const payload = { ...editing, includes: includesText.split('\n').map((s) => s.trim()).filter(Boolean) };
    if (isNew) {
      const { error } = await supabase.from('decoration_packages').insert(payload);
      if (error) return toast.error(error.message);
      toast.success('Package created');
    } else {
      const { error } = await supabase.from('decoration_packages').update(payload).eq('id', payload.id);
      if (error) return toast.error(error.message);
      toast.success('Updated');
    }
    setEditing(null); setIsNew(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this package?')) return;
    await supabase.from('decoration_packages').delete().eq('id', id);
    toast.success('Deleted'); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-rose-900">Decoration Packages</h1>
        <button onClick={openNew} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Package
        </button>
      </div>

      {loading ? <p>Loading...</p> : pkgs.length === 0 ? (
        <p className="text-rose-800/60">No packages yet. Click "Add Package" to create one.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pkgs.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-rose-100 p-4">
              <h3 className="font-serif text-lg text-rose-900">{p.name}</h3>
              <p className="text-sm text-rose-800/70 mt-1 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-rose-900 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-rose-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-rose-900">{isNew ? 'Add Package' : 'Edit Package'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-rose-900 mb-1">Name</label>
                <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Price (₹)</label>
                <input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: +e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Description</label>
                <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg resize-none" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Includes (one per line)</label>
                <textarea rows={4} value={includesText} onChange={(e) => setIncludesText(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg resize-none"
                  placeholder="Floral arch&#10;Stage backdrop&#10;Table centerpieces" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active || false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 border border-rose-200 rounded-lg text-rose-800">Cancel</button>
              <button onClick={save} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
