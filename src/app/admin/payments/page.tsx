'use client';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import DataTable from '@/components/admin/DataTable';
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  useEffect(() => {
    supabase.from('payments').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data || []); setLoading(false); });
  }, []);
  const columns = [
    { key: 'booking_id', label: 'Booking', render: (r: any) => String(r.booking_id).slice(0, 8) + '…' },
    { key: 'razorpay_order_id', label: 'Order ID' },
    { key: 'razorpay_payment_id', label: 'Payment ID' },
    { key: 'amount', label: 'Amount', render: (r: any) => '₹' + Number(r.amount).toLocaleString('en-IN') },
    { key: 'currency', label: 'Cur' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created', render: (r: any) => new Date(r.created_at).toLocaleString('en-IN') },
  ];
  return (<div><h1 className="font-serif text-3xl text-rose-900 mb-6">Payments</h1>
    <DataTable columns={columns} data={payments} searchKeys={['razorpay_order_id', 'razorpay_payment_id', 'status']} loading={loading} emptyMessage="No payments yet." /></div>);
}
