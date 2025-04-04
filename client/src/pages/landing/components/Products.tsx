import { ChevronRight } from "lucide-react";

export default function Products() {
  // Sample product categories
  const productCategories = [
    {
      id: 1,
      title: "Professional Chef Knives",
      description: "High-carbon stainless steel blades designed for precision and control.",
      image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Premium Flatware Sets",
      description: "Elegant stainless steel flatware sets for fine dining establishments.",
      image: "https://images.unsplash.com/photo-1623227860071-02181424c2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Specialty Kitchen Tools",
      description: "Professional-grade utensils designed for specific culinary applications.",
      image: "https://images.unsplash.com/photo-1572865653364-ef6d3a152fcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section className="py-16 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Our Premium Collections</h2>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Explore our curated selection of professional-grade cutlery, designed for both aesthetics and functionality.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{category.title}</h3>
                <p className="text-neutral-600 mb-4">{category.description}</p>
                <a href="#" className="text-primary-600 font-medium hover:text-primary-700 flex items-center">
                  View Collection <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
