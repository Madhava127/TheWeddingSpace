import { createClient } from '@/lib/supabase/server';
import { BookingWizard } from '@/components/booking/BookingWizard';

export default async function BookPage(props: { searchParams: Promise<{ hall?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const [{ data: halls }, { data: blockedDates }, { data: foodCategories }, { data: foodItems }, { data: decorationPackages }, { data: photographyPackages }, { data: siteSettings }] = await Promise.all([
    supabase.from('halls').select('*').eq('is_active', true),
    supabase.from('hall_blocked_dates').select('*'),
    supabase.from('food_categories').select('*').order('sort_order'),
    supabase.from('food_items').select('*').eq('is_active', true),
    supabase.from('decoration_packages').select('*').eq('is_active', true),
    supabase.from('photography_packages').select('*').eq('is_active', true),
    supabase.from('site_settings').select('*').single()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingWizard 
        halls={halls || []} 
        blockedDates={blockedDates || []}
        foodCategories={foodCategories || []}
        foodItems={foodItems || []}
        decorationPackages={decorationPackages || []}
        photographyPackages={photographyPackages || []}
        settings={siteSettings || { gst_percent: 18, default_advance_percent: 20 }}
        initialHallId={searchParams.hall || null}
      />
    </div>
  );
}
