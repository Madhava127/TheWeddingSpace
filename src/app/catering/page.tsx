import { createClient } from '@/lib/supabase/server';
export const metadata = { title: 'Catering — TheWeddingSpace' };
export default async function CateringPage() {
  const supabase = await createClient();
  const [{ data: cats }, { data: items }] = await Promise.all([
    supabase.from('food_categories').select('*').order('sort_order'),
    supabase.from('food_items').select('*').eq('is_active', true),
  ]);
  const categories = cats || [];
  const foods = items || [];
  return (
    <main className="min-h-screen bg-rose-50/30 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-serif text-5xl text-rose-900 mb-4">Catering Menus</h1>
          <p className="text-rose-800/70 max-w-xl mx-auto">Delicious multi-cuisine menus prepared by our partner chefs. Prices are per plate.</p>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-20 text-rose-800/60"><p>No catering items available yet.</p></div>
        ) : categories.map((cat: any) => {
          const catItems = foods.filter((i: any) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2 className="font-serif text-3xl text-rose-900 mb-6">{cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-rose-900">{item.name}</h3>
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (item.is_veg ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                        {item.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                    <p className="text-rose-800/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-rose-50">
                      <span className="text-rose-900 font-semibold">₹{Number(item.price_per_plate).toLocaleString('en-IN')}<span className="text-xs text-rose-800/60 font-normal"> / plate</span></span>
                      {item.cuisine && <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{item.cuisine}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
