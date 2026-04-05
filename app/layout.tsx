// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Header from '@/components/Layout/header';
import Footer from '@/components/Layout/footer';
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from '@/components/cart/cart-provider';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopNow - Your One-Stop Online Store',
  description: 'Discover amazing products at unbeatable prices. Shop electronics, fashion, home goods and more.',
  keywords: 'ecommerce, shopping, online store, electronics, fashion',
  authors: [{ name: 'ShopNow' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shopnow.com',
    title: 'ShopNow - Your One-Stop Online Store',
    description: 'Discover amazing products at unbeatable prices.',
    siteName: 'ShopNow',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <CartProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster /> 
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}