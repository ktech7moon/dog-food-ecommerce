import { Button } from "@/components/ui/button";
import { Shield, Truck } from "lucide-react";

const CallToAction = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Give Your Dog the Nutrition They Deserve</h2>
          <p className="text-lg mb-8">Join hundreds of happy dog owners who've made the switch to real, nutritious food. Your pup will thank you!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => scrollToSection('products')}
              className="bg-accent hover:bg-accent/90 text-white font-semibold rounded-full px-8 py-3"
            >
              Shop Meal Plans
            </Button>
            <Button 
              onClick={() => scrollToSection('faq')}
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary font-semibold rounded-full px-8 py-3"
            >
              Learn More
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center items-center gap-6">
            <div className="flex items-center">
              <img 
                src="https://images.unsplash.com/photo-1583511655826-05700442b0b2" 
                alt="Happy golden retriever" 
                className="w-12 h-12 rounded-full object-cover" 
              />
              <span className="ml-2">Thousands of<br />Happy Dogs</span>
            </div>
            <div className="h-10 border-r border-white/30 hidden md:block"></div>
            <div className="flex items-center">
              <Shield className="text-accent mr-2 h-8 w-8" />
              <span>Money-Back<br />Guarantee</span>
            </div>
            <div className="h-10 border-r border-white/30 hidden md:block"></div>
            <div className="flex items-center">
              <Truck className="text-accent mr-2 h-8 w-8" />
              <span>Fast, Reliable<br />Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
