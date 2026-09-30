import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function HallsPage() {
  const supabase = await createClient();
  const { data: halls } = await supabase
    .from('halls')
    .select('*')
    .eq('is_active', true);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Premium Venues</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the perfect setting for your celebration. From intimate gatherings to grand celebrations, we have a space for every need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {halls?.map((hall: any) => (
          <Link href={`/halls/${hall.id}`} key={hall.id} className="group">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={hall.cover_image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'}
                  alt={hall.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center text-sm font-semibold text-amber-600 shadow-sm">
                  <Star size={16} className="fill-current mr-1" />
                  {hall.rating}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{hall.name}</h2>
                <div className="flex items-center text-gray-500 mb-4 text-sm">
                  <MapPin size={16} className="mr-1" /> {hall.address}, {hall.city}
                </div>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Users size={16} className="mr-2 text-rose-500" />
                    <span>{hall.capacity_min} - {hall.capacity_max} guests</span>
                  </div>
                </div>

                <div className="mt-auto border-t pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Rental Price</p>
                    <p className="text-xl font-bold text-rose-600">₹{hall.base_price?.toLocaleString('en-IN')}</p>
                  </div>
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {halls?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No venues available at the moment.</p>
        </div>
      )}
    </div>
  );
}
