import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { HallGallery } from '@/components/halls/HallGallery';
import { MapPin, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HallDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();

  const { data: hall } = await supabase
    .from('halls')
    .select('*')
    .eq('id', id)
    .single();

  if (!hall) {
    notFound();
  }

  const images = hall.images || (hall.cover_image ? [hall.cover_image] : []);

  return (
    <div className="container mx-auto px-4 py-8">
      <HallGallery images={images} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{hall.name}</h1>
          <div className="flex items-center text-gray-500 mb-8">
            <MapPin size={20} className="mr-2 text-rose-500" />
            <span className="text-lg">{hall.address}, {hall.city}, {hall.state} {hall.pincode}</span>
          </div>

          <div className="prose max-w-none mb-12">
            <h3 className="text-2xl font-serif font-semibold mb-4 text-gray-900">About this Venue</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{hall.description}</p>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-serif font-semibold mb-6 text-gray-900">Amenities & Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {hall.amenities?.map((amenity: any, idx: any) => (
                <div key={idx} className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <CheckCircle2 size={18} className="text-rose-500 mr-3 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24 border border-rose-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h3>
            
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Rental Price</span>
                <span className="text-xl font-bold text-rose-600">₹{hall.base_price?.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Veg Plate (per pax)</span>
                <span className="font-semibold text-gray-900">₹{hall.price_per_plate_veg}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Non-Veg Plate (per pax)</span>
                <span className="font-semibold text-gray-900">₹{hall.price_per_plate_nonveg}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600 flex items-center"><Users size={16} className="mr-2" /> Capacity</span>
                <span className="font-semibold text-gray-900">{hall.capacity_min} - {hall.capacity_max} guests</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Advance required</span>
                <span className="font-semibold text-gray-900">{hall.advance_percent}%</span>
              </div>
            </div>

            <Link href={`/book?hall=${hall.id}`} className="block w-full">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-6 text-lg rounded-full shadow-md shadow-rose-200">
                Start Booking
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
