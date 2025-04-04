import MainLayout from "@/layouts/MainLayout";
import Hero from "./components/Hero";
import About from "./components/About";
import Products from "./components/Products";
import WholesalerForm from "./components/WholesalerForm";
import Footer from "./components/Footer";

export default function Landing() {
  return (
    <MainLayout>
      <Hero />
      <About />
      <Products />
      <WholesalerForm />
    </MainLayout>
  );
}
