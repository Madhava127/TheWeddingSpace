import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  booking_id: z.string().uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = schema.parse(body);

    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify payment in DB
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('advance_amount, total_amount')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine if full or advance was paid based on amounts. In this case we just mark advance_paid for now
    const paymentStatus = 'advance_paid';

    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: paymentStatus,
        status: 'confirmed',
        razorpay_order_id,
        razorpay_payment_id,
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Failed to update booking', updateError);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    // Update payments table
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('booking_id', booking_id);

    return NextResponse.json({ success: true, booking_id });

  } catch (error) {
    console.error('Verify payment error', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
