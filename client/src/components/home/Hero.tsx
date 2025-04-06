import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, Truck } from "lucide-react";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="md:flex items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">Real Food for Your <span className="text-primary-foreground dark:text-foreground bg-primary px-2 py-1 rounded">Real Best Friend</span></h1>
            <p className="text-lg mb-8">Homemade, nutritious dog food delivered to your door. Made with human-grade ingredients your pup will love.</p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => scrollToSection('products')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-6"
              >
                Shop Now
              </Button>
              <Button 
                onClick={() => scrollToSection('how-it-works')}
                variant="outline"
                className="bg-background border-2 border-primary hover:bg-primary/5 text-primary font-semibold rounded-full px-8 py-6"
              >
                Learn More
              </Button>
            </div>
            <div className="mt-8 flex items-center text-sm">
              <span className="mr-2 text-primary"><Star className="h-4 w-4 inline" /></span>
              <span className="font-semibold">4.9/5 stars</span>
              <span className="mx-2">•</span>
              <span>500+ happy dogs</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Truck className="h-4 w-4 text-primary mr-1 inline" />
                Free shipping over $50
              </span>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e" 
                alt="Happy dog enjoying homemade food" 
                className="w-full h-auto rounded-xl" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                <p className="text-sm italic">"Bailey has never been healthier or happier with his meals!" - Sarah T.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trust badges */}
      <div className="bg-gray-50 dark:bg-gray-800 py-6 shadow-inner">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex flex-col items-center">
              <i className="fas fa-medal text-primary text-2xl mb-2"></i>
              <span className="text-sm font-medium text-center">Human-Grade<br />Ingredients</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-heart text-primary text-2xl mb-2"></i>
              <span className="text-sm font-medium text-center">Vet<br />Approved</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-shipping-fast text-primary text-2xl mb-2"></i>
              <span className="text-sm font-medium text-center">Free Delivery<br />Over $50</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-clock text-primary text-2xl mb-2"></i>
              <span className="text-sm font-medium text-center">Fresh<br />Weekly</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fas fa-undo text-primary text-2xl mb-2"></i>
              <span className="text-sm font-medium text-center">Satisfaction<br />Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
