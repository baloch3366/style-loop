import { Truck, CreditCard, Shield, Phone } from 'lucide-react';

const features = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Secure Payment',
    description: '100% secure transactions',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: '30-Day Returns',
    description: 'Money-back guarantee',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: '24/7 Support',
    description: 'Dedicated support',
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function FeaturesBanner() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gray-50 rounded-xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className={`${feature.color} p-3 rounded-full`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}