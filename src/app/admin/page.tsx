import { createClient } from '@/lib/supabase/server';
import { CalendarCheck, CreditCard, Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: bookingsCount }, { count: hallsCount }, { data: bookings }] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('halls').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('total_amount, status').in('status', ['confirmed', 'completed']),
  ]);

  const totalRevenue = bookings?.reduce((acc: any, curr: any) => acc + (curr.total_amount || 0), 0) || 0;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Bookings</h3>
            <CalendarCheck className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{bookingsCount || 0}</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">Total Revenue</h3>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">₹{(totalRevenue).toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">Active Halls</h3>
            <Building2 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{hallsCount || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-700">Pending Payments</h3>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">Manage</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link href="/admin/halls" className="text-blue-600 hover:underline">Manage Halls</Link>
          <Link href="/admin/bookings" className="text-blue-600 hover:underline">View All Bookings</Link>
        </div>
      </div>
    </div>
  );
}
