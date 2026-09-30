import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default async function BookingSuccessPage(props: { searchParams: Promise<{ booking?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-green-100">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Your advance payment has been successfully processed. We have sent the booking details to your email.
        </p>
        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-500 mb-8">
          Booking ID: <span className="font-mono text-gray-900 font-bold">{searchParams.booking}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button className="w-full bg-gray-900 text-white rounded-full">View Dashboard</Button>
          </Link>
          <Button variant="outline" className="w-full rounded-full" onClick={() => window.print()}>Print Receipt</Button>
        </div>
      </div>
    </div>
  );
}
