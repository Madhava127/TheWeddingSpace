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
              {settings.contact_email && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Email</div>
                  <a href={'mailto:' + settings.contact_email} className="hover:text-rose-600">{settings.contact_email}</a>
                </div>
              )}
              {settings.contact_phone && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Phone</div>
                  <a href={'tel:' + settings.contact_phone} className="hover:text-rose-600">{settings.contact_phone}</a>
                </div>
              )}
              {settings.address && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-rose-500 mb-1">Address</div>
                  <div className="whitespace-pre-line">{settings.address}</div>
                </div>
              )}
              {(settings.instagram_url || settings.facebook_url) && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-rose-500 mb-2">Follow Us</div>
                  <div className="flex gap-4">
                    {settings.instagram_url && (
                      <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-rose-600">Instagram</a>
                    )}
                    {settings.facebook_url && (
                      <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="hover:text-rose-600">Facebook</a>
                    )}
                  </div>
                </div>
              )}
              {!settings.contact_email && !settings.contact_phone && !settings.address && !settings.instagram_url && !settings.facebook_url && (
                <p className="text-rose-800/60 text-sm">Contact details will appear here once set in the admin panel.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
