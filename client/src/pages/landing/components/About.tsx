import { Award, Globe, HeartHandshake } from "lucide-react";

export default function About() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800">About Our Company</h2>
            <p className="text-neutral-600 text-lg">Delivering premium cutlery solutions to businesses worldwide since 1995.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="inline-block p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Premium Quality</h3>
              <p className="text-neutral-600">Crafted with the finest materials for durability and performance.</p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="inline-block p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Global Distribution</h3>
              <p className="text-neutral-600">Serving restaurants, hotels, and retailers across 40+ countries.</p>
            </div>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="inline-block p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Dedicated Support</h3>
              <p className="text-neutral-600">Expert assistance to ensure your complete satisfaction.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
