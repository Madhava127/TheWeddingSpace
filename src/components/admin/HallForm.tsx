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
