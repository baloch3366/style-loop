
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/mongoose';
import Order from '@/lib/models/order-model';
import Product from '@/lib/models/products-model';

const PAYPAL_API = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  // Same as above
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=missing_token`);
    }

    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureResponse.json();

    if (captureData.status === 'COMPLETED') {
      // Find order by PayPal order ID
      await connectToDatabase();
      const order = await Order.findOne({ paypalOrderId: token });
      
      if (order) {
        // Update order status
        order.status = 'paid';
        order.paidAt = new Date();
        order.paypalCaptureId = captureData.purchase_units[0].payments.captures[0].id;
        await order.save();

        // 🔥 Increment totalSold
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { totalSold: item.quantity }
          });
        }

        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation/${order._id}`
        );
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=payment_failed`
    );
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=payment_failed`
    );
  }
}