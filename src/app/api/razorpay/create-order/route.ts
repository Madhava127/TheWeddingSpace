import { NextResponse } from 'next/server';
import { z } from 'zod';
import { razorpay } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  booking_id: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_id } = schema.parse(body);

    const supabase = createAdminClient();

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, advance_amount, total_amount')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const amount = Number(booking.advance_amount || booking.total_amount);
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking_id,
    });

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Insert payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id,
        razorpay_order_id: order.id,
        amount,
        currency: 'INR',
        status: 'created',
      });

    if (paymentError) {
      console.error('Failed to create payment record', paymentError);
    }

    return NextResponse.json({
      order_id: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Create order error', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
