import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createAdminClient();

    console.log('Razorpay Webhook Event:', event.event, event.payload?.payment?.entity?.id);

    // Handle events
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        
        if (orderId) {
          // Find booking by order id
          const { data: payRecord } = await supabase
            .from('payments')
            .select('booking_id')
            .eq('razorpay_order_id', orderId)
            .single();

          if (payRecord?.booking_id) {
            await supabase
              .from('bookings')
              .update({ payment_status: 'advance_paid', status: 'confirmed' })
              .eq('id', payRecord.booking_id);
              
            await supabase
              .from('payments')
              .update({ status: 'captured', raw_response: payment })
              .eq('razorpay_order_id', orderId);
          }
        }
        break;
      }
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;
        if (orderId) {
          await supabase
            .from('payments')
            .update({ status: 'failed', raw_response: payment })
            .eq('razorpay_order_id', orderId);
        }
        break;
      }
      // Handle other events as needed
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
