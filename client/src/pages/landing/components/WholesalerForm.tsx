import WholesalerRequestForm from "@/components/wholesaler-request-form";

export default function WholesalerForm() {
  return (
    <section id="become-wholesaler" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Become a Wholesaler</h2>
            <p className="text-neutral-600 text-lg">Join our network of premium retailers and gain access to exclusive pricing and products.</p>
          </div>
          <div className="bg-neutral-50 p-8 rounded-lg shadow-sm">
            <WholesalerRequestForm />
          </div>
        </div>
      </div>
    </section>
  );
}
