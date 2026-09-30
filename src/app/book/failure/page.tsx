'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailureContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-red-100">
      <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <XCircle size={48} />
      </div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Payment Failed</h1>
      <p className="text-gray-600 mb-8">
        We couldn't process your payment. Don't worry, your booking details are saved. You can try paying the advance again.
      </p>
      {bookingId && (
        <p className="text-sm text-gray-500 mb-8">Booking ID: {bookingId}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/book`}>
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-full">Try Again</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full rounded-full">View Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default function BookingFailurePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <FailureContent />
      </Suspense>
    </div>
  );
}
