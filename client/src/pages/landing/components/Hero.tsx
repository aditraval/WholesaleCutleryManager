import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative py-24 bg-cover bg-center bg-blend-overlay bg-neutral-800 bg-opacity-60" style={{ 
      backgroundImage: "url('https://images.unsplash.com/photo-1594226801341-41427b4e5c22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800&q=80')" 
    }}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="font-bold text-4xl md:text-5xl mb-6">Premium Cutlery for Discerning Wholesalers</h1>
          <p className="text-lg mb-8">Experience exceptional craftsmanship and unmatched quality with our exclusive range of professional-grade cutlery products.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
              Browse Our Catalog
            </Button>
            <Button size="lg" variant="outline" className="bg-white hover:bg-gray-100 text-primary-700">
              <Link href="#become-wholesaler">Become a Wholesaler</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
