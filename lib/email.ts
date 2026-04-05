import { Resend } from 'resend';
import { OrderConfirmationEmail } from '../email/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface OrderConfirmationEmailProps {
  to: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderConfirmationEmailProps) {
  try {
    const recipient = process.env.TEST_EMAIL || to;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [recipient],
      subject: `Order Confirmation #${orderNumber}`,
      react: OrderConfirmationEmail({
        customerName,
        orderNumber,
        items,
        subtotal,
        shipping,
        tax,
        total,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
}

export async function sendResetPasswordEmail(email: string, token: string) {
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    const recipient = process.env.TEST_EMAIL || email;
    console.log('📧 Sending reset email to:', recipient);
    console.log('🔗 Reset URL:', resetUrl);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your account. Click the link below to set a new password:</p>
          <p>
            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            If the button doesn't work, copy and paste this URL: ${resetUrl}
          </p>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [recipient],
      subject: 'Password Reset Request',
      html,
    });

    if (error) {
      console.error('Resend error (password reset):', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    // We don't throw here to avoid exposing details to the client
  }
}