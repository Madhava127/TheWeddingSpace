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
