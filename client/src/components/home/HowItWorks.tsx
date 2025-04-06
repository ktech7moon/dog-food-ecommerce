import { CheckCircle } from "lucide-react";

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="max-w-2xl mx-auto text-lg">Fresh, homemade dog food delivered to your door in three simple steps.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-bold mb-3">Choose Your Plan</h3>
            <p>Select from our Chicken Delight, Beef Bonanza, or create a custom meal plan tailored to your dog's needs.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-bold mb-3">We Cook & Package</h3>
            <p>We prepare fresh batches of nutritionally balanced meals and package them for your pup's enjoyment.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-bold mb-3">Regular Delivery</h3>
            <p>Receive your dog's meals according to your schedule - weekly, bi-weekly, or monthly.</p>
          </div>
        </div>
        
        <div className="mt-16 bg-card rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <h3 className="text-2xl font-bold mb-4">The Freshness Guarantee</h3>
              <p className="mb-4">We prepare your dog's meals just days before delivery, using locally sourced ingredients whenever possible.</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                  <span>Made fresh weekly in small batches</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                  <span>Flash-frozen to preserve nutrients</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                  <span>Delivered in eco-friendly insulated packaging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-success mt-1 mr-2 h-5 w-5" />
                  <span>No preservatives or artificial ingredients</span>
                </li>
              </ul>
              <a href="#faq" className="text-accent font-medium hover:underline inline-block mt-4">
                Learn more about our process <i className="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1596797038530-2c107229654b" 
                alt="Fresh ingredients for dog food" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
