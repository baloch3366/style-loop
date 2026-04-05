// app/components/layout/footer.tsx
import Link from 'next/link';
import { Store, CreditCard, ShieldCheck, Truck, Phone } from 'lucide-react';

const footerLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Shipping Info', href: '/shipping' },
  { name: 'Returns', href: '/returns' },
  { name: 'About Us', href: '/about' },
];

const paymentMethods = ['Visa', 'MasterCard', 'PayPal', 'Apple Pay', 'Google Pay'];

export default function TwoRowFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      {/* Row 1: Links & Copyright */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-2">
            {/* Brand & Copyright */}
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-blue-400" />
              <span className="font-medium">ShopNow</span>
              <span className="text-gray-500 text-xs">© {currentYear}</span>
            </div>
            
            {/* Center Links */}
            <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
              {footerLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {/* Email */}
            <a 
              href="mailto:support@shopnow.com" 
              className="text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
            >
              support@shopnow.com
            </a>
          </div>
        </div>
      </div>
      
      {/* Row 2: Payment Methods & More Links */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-2">
          {/* Payment Methods */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="hidden sm:inline">We accept:</span>
            <div className="flex gap-1">
              {paymentMethods.slice(0, 3).map((method) => (
                <span 
                  key={method} 
                  className="bg-gray-800 px-2 py-1 rounded text-xs"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          
          {/* More Links */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
            {footerLinks.slice(4).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/careers" className="hover:text-white transition-colors">
              Careers
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
          </div>
          
          {/* Country/Region */}
          <div className="text-xs text-gray-500">
            India • English
          </div>
        </div>
      </div>
    </footer>
  );
}