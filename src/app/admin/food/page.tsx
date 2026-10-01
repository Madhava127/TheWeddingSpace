'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

export default function AdminFoodPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
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

  async function save(form: any) {
    if (isNew) {
      const { error } = await supabase.from('food_items').insert(form);
      if (error) return toast.error(error.message);
      toast.success('Item created');
    } else {
      const { error } = await supabase.from('food_items').update(form).eq('id', form.id);
      if (error) return toast.error(error.message);
      toast.success('Updated');
    }
    setEditing(null); setIsNew(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    await supabase.from('food_items').delete().eq('id', id);
    toast.success('Deleted'); load();
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category_id', label: 'Category', render: (r: any) => cats.find((c) => c.id === r.category_id)?.name || '—' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'is_veg', label: 'Type', render: (r: any) => r.is_veg ? '🟢 Veg' : '🔴 Non-Veg' },
    { key: 'price_per_plate', label: '₹ / plate', render: (r: any) => '₹' + Number(r.price_per_plate).toLocaleString('en-IN') },
    { key: 'actions', label: '', render: (r: any) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setIsNew(false); }} className="text-rose-600"><Pencil size={16} /></button>
        <button onClick={() => handleDelete(r.id)} className="text-red-500"><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-rose-900">Food & Catering</h1>
        <button onClick={() => { setEditing({ name: '', cuisine: '', price_per_plate: 0, description: '', is_veg: true, category_id: cats[0]?.id, is_active: true }); setIsNew(true); }}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <DataTable columns={columns} data={items} searchKeys={['name', 'cuisine']} loading={loading} emptyMessage="No food items yet." />

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl text-rose-900">{isNew ? 'Add Item' : 'Edit Item'}</h2>
              <button onClick={() => { setEditing(null); setIsNew(false); }}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-rose-900 mb-1">Name</label>
                <input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Category</label>
                <select value={editing.category_id || ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg">
                  <option value="">— None —</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Cuisine</label>
                <input value={editing.cuisine || ''} onChange={(e) => setEditing({ ...editing, cuisine: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Price per plate (₹)</label>
                <input type="number" value={editing.price_per_plate || 0} onChange={(e) => setEditing({ ...editing, price_per_plate: +e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Description</label>
                <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg resize-none" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_veg || false} onChange={(e) => setEditing({ ...editing, is_veg: e.target.checked })} />
                  Vegetarian
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active || false} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2 border border-rose-200 rounded-lg text-rose-800">Cancel</button>
              <button onClick={() => save(editing)} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-lg font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
