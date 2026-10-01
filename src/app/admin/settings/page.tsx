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
