import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/database/mongoose';
import Order from '@/lib/models/order-model';
import { auth } from '@/lib/auth/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    await connectToDatabase();
    const order = await Order.findById(orderId)
      .populate('items.productId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Transform order items for Stripe
    // const lineItems = order.items.map((item: any) => ({
    //   price_data: {
    //     currency: 'usd',
    //     product_data: {
    //       name: item.name,
    //      metadata: {
    //      productId: item.productId._id.toString(),
    //      },
    //     },
    //     unit_amount: Math.round(item.price * 100), // Stripe uses cents
    //   },
    //   quantity: item.quantity,
    // }));

      const lineItems = order.items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
        }));


    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?canceled=true`,
      metadata: {
        orderId: orderId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}