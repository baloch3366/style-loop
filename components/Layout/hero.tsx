import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <span className="text-sm font-medium">New Collection</span>
            <span className="h-1 w-1 rounded-full bg-white" />
            <span className="text-sm">Free Shipping</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Discover Amazing{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              Products
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Shop the latest trends in fashion, electronics, and home goods.
            Quality products at unbeatable prices with fast delivery.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm text-gray-300">Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm text-gray-300">Customer Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold">Free</div>
              <div className="text-sm text-gray-300">Shipping</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400 to-transparent opacity-20 blur-3xl" />
      <div className="absolute bottom-1/4 right-10 h-72 w-72 rounded-full bg-gradient-to-l from-purple-400 to-transparent opacity-20 blur-3xl" />
    </div>
  );
}