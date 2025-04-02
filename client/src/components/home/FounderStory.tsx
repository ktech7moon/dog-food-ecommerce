import React from "react";
import { Heart, Leaf, ShieldCheck } from "lucide-react";

const FounderStory = () => {
  return (
    <section id="founder-story" className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Founder's Journey</h2>
          <p className="text-gray-600 text-lg">A passion for nutrition that became a mission for our furry friends</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-xl">
            <div className="bg-primary/5 p-8 h-full">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">The Turning Point</h3>
                    <p className="text-gray-700">
                      When my beloved dog Max started having health issues, I began researching what was actually in his food. 
                      I was shocked to discover most commercial dog foods—even premium brands—contained fillers, 
                      preservatives, and meat by-products that offered little nutritional value.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">The Harsh Reality</h3>
                    <p className="text-gray-700">
                      I learned that many commercial dog foods contain harmful additives like BHA and BHT 
                      (linked to cancer), excessive grain fillers that dogs struggle to digest, and 
                      mysterious "meat by-products" that can include diseased tissues. Even "grain-free" 
                      options often substitute with starchy alternatives offering little nutritional improvement.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">A Promise Made</h3>
                    <p className="text-gray-700">
                      I promised Max I would create something better—real food made with human-grade 
                      ingredients that would nourish him properly. After consulting with veterinary 
                      nutritionists and countless hours in the kitchen, PawsomeMeals was born. 
                      Max thrived on this new diet, and I knew I had to share it with other pet parents who care 
                      about what goes into their dogs' bowls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <blockquote className="italic text-xl text-gray-700 border-l-4 border-primary pl-6 py-2">
              "I couldn't find healthy food I'd be comfortable eating myself, so I created it—because our dogs deserve nothing less than real, wholesome nutrition."
            </blockquote>
            
            <p className="text-gray-700">
              Today, PawsomeMeals delivers fresh, nutritionally complete meals to dogs across the country. 
              Each recipe is carefully formulated to provide optimal nutrition with real, recognizable ingredients: 
              lean proteins, fresh vegetables, healthy oils, and balanced supplements—no fillers, no by-products, 
              no artificial preservatives.
            </p>
            
            <p className="text-gray-700">
              The difference is visible: shinier coats, healthier weights, improved digestion, and more energy. 
              But most importantly, I see happier dogs enjoying mealtime like never before—just like Max did.
            </p>
            
            <p className="text-gray-700 font-medium">
              This isn't just a business—it's a mission to transform how we feed our beloved companions, 
              one bowl at a time.
            </p>
            
            <div className="mt-6">
              <p className="font-bold text-lg">Sarah Thompson</p>
              <p className="text-gray-600">Founder, PawsomeMeals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderStory;