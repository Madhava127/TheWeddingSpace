import { createClient } from '@/lib/supabase/server';

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, halls(name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Manage Bookings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-600">
            <tr>
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Hall</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Payment</th>
              <th className="p-4 font-medium">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking: any) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-500 font-mono text-xs">{booking.id.split('-')[0]}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{booking.customer_name}</div>
                  <div className="text-gray-500 text-xs">{booking.customer_phone}</div>
                </td>
                <td className="p-4">{booking.halls?.name}</td>
                <td className="p-4">{new Date(booking.event_date).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase
                    ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                    ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {booking.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase
                    ${booking.payment_status === 'unpaid' ? 'bg-gray-100 text-gray-700' : ''}
                    ${booking.payment_status === 'advance_paid' ? 'bg-indigo-100 text-indigo-700' : ''}
                    ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : ''}
                    ${booking.payment_status === 'refunded' ? 'bg-purple-100 text-purple-700' : ''}
                  `}>
                    {booking.payment_status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 font-medium">{booking.total_amount?.toLocaleString('en-IN')}</td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
