import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, MapPin, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, halls(name, city)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Bookings</h1>

      <div className="grid grid-cols-1 gap-6">
        {bookings?.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border">
            <h3 className="text-xl font-medium text-gray-900 mb-4">You have no bookings yet.</h3>
            <Link href="/halls">
              <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-full">
                Explore Venues
              </Button>
            </Link>
          </div>
        ) : (
          bookings?.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider
                    ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                    ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {booking.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider
                    ${booking.payment_status === 'unpaid' ? 'bg-gray-100 text-gray-700' : ''}
                    ${booking.payment_status === 'advance_paid' ? 'bg-indigo-100 text-indigo-700' : ''}
                    ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : ''}
                    ${booking.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {booking.payment_status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{booking.halls?.name}</h3>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                  <div className="flex items-center"><Calendar size={16} className="mr-2 text-rose-500" /> {new Date(booking.event_date).toLocaleDateString()}</div>
                  <div className="flex items-center"><MapPin size={16} className="mr-2 text-rose-500" /> {booking.halls?.city}</div>
                  <div className="flex items-center"><IndianRupee size={16} className="mr-2 text-rose-500" /> {booking.total_amount?.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                {booking.payment_status === 'advance_paid' && (
                  <Button className="bg-rose-600 text-white w-full md:w-auto rounded-full">
                    Pay Balance
                  </Button>
                )}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <Button variant="outline" className="w-full md:w-auto rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
