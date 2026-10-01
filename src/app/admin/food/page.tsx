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
