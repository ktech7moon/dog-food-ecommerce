import Hero from "@/components/home/Hero";
import Products from "@/components/home/Products";
import HowItWorks from "@/components/home/HowItWorks";
import Ingredients from "@/components/home/Ingredients";
import FounderStory from "@/components/home/FounderStory";
import Reviews from "@/components/home/Reviews";
import FAQ from "@/components/home/FAQ";
import CallToAction from "@/components/home/CallToAction";
import Contact from "@/components/home/Contact";
import Newsletter from "@/components/home/Newsletter";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>PawsomeMeals | Homemade Dog Food Delivered</title>
        <meta name="description" content="Homemade, nutritious dog food delivered to your door. Made with human-grade ingredients your pup will love." />
      </Helmet>
      <main className="flex-grow">
        <Hero />
        <Products />
        <HowItWorks />
        <Ingredients />
        <FounderStory />
        <Reviews />
        <FAQ />
        <CallToAction />
        <Contact />
        <Newsletter />
      </main>
    </>
  );
};

export default Home;
