#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Fixing contact page + admin CRUD..."

# =====================================================
# 1. CONTACT PAGE — add Instagram / Facebook rendering
# =====================================================
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
EOF

# =====================================================
# 2. ADMIN FOOD — editable name, cuisine, price, description
# =====================================================
cat > src/app/admin/food/page.tsx << 'EOF'
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
EOF

# =====================================================
# 3. ADMIN DECORATION — full CRUD with edit form
# =====================================================
cat > src/app/admin/decoration/page.tsx << 'EOF'
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
EOF

# =====================================================
# 4. ADMIN PHOTOGRAPHY — full CRUD with edit form
# =====================================================
cat > src/app/admin/photography/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { Trash2, Pencil, Plus, X } from 'lucide-react';

export default function AdminPhotographyPage() {
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [featuresText, setFeaturesText] = useState('');
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('photography_packages').select('*').order('created_at', { ascending: false });
    setPkgs(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(p: any) {
    setEditing({ ...p }); setIsNew(false);
    setFeaturesText((p.features || []).join('\n'));
  }
  function openNew() {
    setEditing({ name: '', description: '', price: 0, duration_hours: 4, features: [], is_active: true });
    setIsNew(true); setFeaturesText('');
  }

  async function save() {
    const payload = { ...editing, features: featuresText.split('\n').map((s) => s.trim()).filter(Boolean) };
    if (isNew) {
      const { error } = await supabase.from('photography_packages').insert(payload);
      if (error) return toast.error(error.message);
      toast.success('Package created');
    } else {
      const { error } = await supabase.from('photography_packages').update(payload).eq('id', payload.id);
      if (error) return toast.error(error.message);
      toast.success('Updated');
    }
    setEditing(null); setIsNew(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this package?')) return;
    await supabase.from('photography_packages').delete().eq('id', id);
    toast.success('Deleted'); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl text-rose-900">Photography Packages</h1>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-rose-900 mb-1">Price (₹)</label>
                  <input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: +e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-rose-900 mb-1">Duration (hours)</label>
                  <input type="number" value={editing.duration_hours || 0} onChange={(e) => setEditing({ ...editing, duration_hours: +e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Description</label>
                <textarea rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg resize-none" />
              </div>
              <div>
                <label className="block text-sm text-rose-900 mb-1">Features (one per line)</label>
                <textarea rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg resize-none"
                  placeholder="2 photographers&#10;Drone shots&#10;Full-day coverage" />
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
EOF

# =====================================================
# 5. BUILD, COMMIT, PUSH
# =====================================================
echo "Building..."
npm run build 2>&1 | tail -15
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo ""
  echo "Build failed. Fix errors above and run: git add . && git commit -m 'fix' && git push"
  exit 1
fi

echo ""
echo "Build OK. Committing and pushing..."
git add .
git commit -m "feat: admin CRUD for food, decoration, photography + contact social links" || echo "Nothing to commit"
git push || echo "Push failed"

echo ""
echo "======================================"
echo "  DONE"
echo "======================================"
echo ""
echo "Wait 2 minutes for Vercel to deploy, then:"
echo "  - Go to /admin/settings and fill Instagram + Facebook URLs"
echo "  - Go to /admin/food to edit dish names"
echo "  - Go to /admin/decoration to edit decoration packages"
echo "  - Go to /admin/photography to edit photography packages"
echo ""
