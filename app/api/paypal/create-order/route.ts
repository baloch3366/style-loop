import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import Order from '@/lib/models/order-model';
import { auth } from '@/lib/auth/auth';

const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    await connectToDatabase();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const paypalOrder = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: order.total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: order.subtotal.toFixed(2),
                },
                shipping: {
                  currency_code: 'USD',
                  value: order.shipping.toFixed(2),
                },
                tax_total: {
                  currency_code: 'USD',
                  value: order.tax.toFixed(2),
                },
              },
            },
            items: order.items.map((item: any) => ({
              name: item.name,
              unit_amount: {
                currency_code: 'USD',
                value: item.price.toFixed(2),
              },
              quantity: item.quantity.toString(),
            })),
          },
        ],
        application_context: {
          brand_name: 'Your Store Name',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/capture-order`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        },
      }),
    });

    const data = await paypalOrder.json();
    console.log('PayPal order created:', data); // Check structure

    // Store PayPal order ID in your database
    await Order.findByIdAndUpdate(orderId, {
      paypalOrderId: data.id,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}