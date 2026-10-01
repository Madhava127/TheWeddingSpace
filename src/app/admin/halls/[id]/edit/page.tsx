import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import HallForm from '@/components/admin/HallForm';
export default async function EditHallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('halls').select('*').eq('id', id).single();
  if (!data) notFound();
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Edit Hall</h1><HallForm initial={data} /></div>);
}
