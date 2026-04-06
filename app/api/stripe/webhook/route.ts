import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/database/mongoose';
import Order from '@/lib/models/order-model';
import Product from '@/lib/models/products-model';
import User from '@/lib/models/user-model';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmationEmail';

export async function POST(req: Request) {
  // console.log('🔥 Webhook received at:', new Date().toISOString());

  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    // console.error(`Webhook signature verification failed:`, err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      // console.log('✅ Checkout.session.completed event received');
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      // console.log('📦 Order ID from metadata:', orderId);

      if (orderId) {
        await connectToDatabase();

        // Update order status to paid
        const order = await Order.findByIdAndUpdate(
          orderId,
          {
            status: 'paid',
            paymentIntentId: session.payment_intent,
            paidAt: new Date(),
          },
          { new: true }
        ).populate('items.productId');

        // console.log('📦 Order fetched after update:', order?._id);

        if (order) {
          // Increment totalSold for each product
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
              $inc: { totalSold: item.quantity },
            });
          }

          // Get user email
          let userEmail = order.guestEmail || session.customer_email;
          if (!userEmail && order.userId) {
            const user = await User.findById(order.userId);
            userEmail = user?.email;
          }
          // console.log('📧 User email to send to:', userEmail);

          // Get customer name
          const customerName =
            session.customer_details?.name ||
            (order.userId ? (await User.findById(order.userId))?.name : null) ||
            'Valued Customer';

          if (userEmail) {
            // console.log('📤 About to call sendOrderConfirmationEmail');
            // Send email – don't await to avoid delaying webhook response
            sendOrderConfirmationEmail({
              to: userEmail,
              customerName,
              orderNumber: order.orderNumber,
              items: order.items.map((item: any) => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.productId?.images?.thumbnail, // optional
              })),
              subtotal: order.subtotal,
              shipping: order.shipping,
              tax: order.tax,
              total: order.total,
            })
              .then(() => console.log('✅ Email sent successfully'))
              .catch(err => console.error('❌ Email sending failed:', err));
          }
        }
      }
      break;
    }

    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await connectToDatabase();
        await Order.findByIdAndUpdate(orderId, { status: 'payment_failed' });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}