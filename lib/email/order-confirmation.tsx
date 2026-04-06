import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html as EmailHtml,   
  Preview,
  Section,
  Text,
  Row,
  Column,
  Img,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
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

export const OrderConfirmationEmail = ({
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderConfirmationEmailProps) => (
  <EmailHtml>
    <Head />
    <Preview>Your order #{orderNumber} has been confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://yourstore.com/logo.png" // replace with your logo
            width="150"
            height="auto"
            alt="Your Store"
            style={logo}
          />
        </Section>

        <Section style={content}>
          <Heading style={h1}>Thank You for Your Order!</Heading>
          <Text style={text}>Hello {customerName},</Text>
          <Text style={text}>
            Your order <strong>#{orderNumber}</strong> has been confirmed and is being processed.
          </Text>

          <Section style={orderDetails}>
            <Heading as="h2" style={h2}>Order Summary</Heading>
            {items.map((item, idx) => (
              <Row key={idx} style={itemRow}>
                <Column>
                  <Text style={itemName}>{item.name} x {item.quantity}</Text>
                </Column>
                <Column align="right">
                  <Text style={itemPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr style={hr} />
            <Row>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column align="right"><Text style={totalValue}>${subtotal.toFixed(2)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={totalLabel}>Shipping</Text></Column>
              <Column align="right"><Text style={totalValue}>${shipping.toFixed(2)}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={totalLabel}>Tax</Text></Column>
              <Column align="right"><Text style={totalValue}>${tax.toFixed(2)}</Text></Column>
            </Row>
            <Row style={totalRow}>
              <Column><Text style={totalLabelBold}>Total</Text></Column>
              <Column align="right"><Text style={totalValueBold}>${total.toFixed(2)}</Text></Column>
            </Row>
          </Section>

          <Section style={footerNote}>
            <Text style={smallText}>
              You can track your order status by logging into your account.
            </Text>
            <Text style={smallText}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@yourstore.com" style={link}>
                support@yourstore.com
              </Link>
            </Text>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Your Store. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </EmailHtml>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '20px 20px 0',
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const h2 = {
  color: '#2563eb',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 10px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '10px 0',
};

const orderDetails = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const itemRow = {
  marginBottom: '8px',
};

const itemName = {
  fontSize: '14px',
  color: '#333',
};

const itemPrice = {
  fontSize: '14px',
  fontWeight: 500,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '15px 0',
};

const totalLabel = {
  fontSize: '14px',
  color: '#6b7280',
};

const totalValue = {
  fontSize: '14px',
  fontWeight: 500,
};

const totalRow = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '2px solid #e5e7eb',
};

const totalLabelBold = {
  fontSize: '16px',
  fontWeight: 'bold',
};

const totalValueBold = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#2563eb',
};

const footerNote = {
  margin: '30px 0 20px',
};

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '5px 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'none',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  textAlign: 'center' as const,
  margin: '0',
};