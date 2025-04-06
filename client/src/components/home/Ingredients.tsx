import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Ingredients = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section id="ingredients" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quality Ingredients</h2>
          <p className="max-w-2xl mx-auto text-lg">We use only human-grade ingredients that we'd be happy to eat ourselves.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-light rounded-xl p-6 text-center">
            <img 
              src="https://images.unsplash.com/photo-1602491674275-16a8f55ea82c" 
              alt="Free-range chicken" 
              className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" 
            />
            <h3 className="text-xl font-bold mb-2">Protein Sources</h3>
            <p>Free-range chicken or grass-fed beef paired with farm-fresh eggs for complete amino acid profiles.</p>
          </div>
          
          <div className="bg-light rounded-xl p-6 text-center">
            <img 
              src="https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f" 
              alt="Quinoa grains" 
              className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" 
            />
            <h3 className="text-xl font-bold mb-2">Healthy Carbs</h3>
            <p>Nutrient-rich quinoa and sweet potatoes provide sustained energy and essential vitamins.</p>
          </div>
          
          <div className="bg-light rounded-xl p-6 text-center">
            <img 
              src="https://images.unsplash.com/photo-1593600012104-116a4eb8a3f4" 
              alt="Fresh vegetables" 
              className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" 
            />
            <h3 className="text-xl font-bold mb-2">Fresh Vegetables</h3>
            <p>Vitamin-packed carrots, sweet potatoes, and spinach for optimal health and digestion.</p>
          </div>
        </div>
        
        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-light rounded-xl overflow-hidden shadow-lg">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold mb-4">Transparency Matters</h3>
                <p className="mb-6">We believe you should know exactly what's in your dog's food. That's why we list every ingredient and its source.</p>
                
                <div className="bg-white rounded-lg p-5">
                  <h4 className="font-semibold mb-3">Nutritional Benefits:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-secondary">Protein</h5>
                      <p className="text-sm">Muscle development, tissue repair</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-secondary">Healthy Fats</h5>
                      <p className="text-sm">Energy, coat health, brain function</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-secondary">Complex Carbs</h5>
                      <p className="text-sm">Sustained energy, digestion</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-secondary">Vitamins & Minerals</h5>
                      <p className="text-sm">Immune support, cellular health</p>
                    </div>
                  </div>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-full px-6 py-2 mt-6"
                    >
                      View Full Nutrition Facts
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Detailed Nutrition Information</DialogTitle>
                      <DialogDescription>
                        Complete nutritional analysis of our homemade dog food recipes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <h4 className="font-bold mb-3">Chicken Delight (Per 8oz serving)</h4>
                      <div className="grid grid-cols-2 gap-y-2">
                        <div>Protein: 26g</div>
                        <div>Fat: 14g</div>
                        <div>Carbohydrates: 18g</div>
                        <div>Fiber: 3g</div>
                        <div>Calcium: 120mg</div>
                        <div>Phosphorus: 240mg</div>
                        <div>Vitamin A: 1200IU</div>
                        <div>Vitamin D: 120IU</div>
                        <div>Omega-3: 1.8g</div>
                        <div>Omega-6: 3.2g</div>
                      </div>
                      
                      <h4 className="font-bold mt-6 mb-3">Beef Bonanza (Per 8oz serving)</h4>
                      <div className="grid grid-cols-2 gap-y-2">
                        <div>Protein: 28g</div>
                        <div>Fat: 16g</div>
                        <div>Carbohydrates: 16g</div>
                        <div>Fiber: 2.8g</div>
                        <div>Calcium: 130mg</div>
                        <div>Phosphorus: 260mg</div>
                        <div>Vitamin A: 1000IU</div>
                        <div>Vitamin D: 130IU</div>
                        <div>Omega-3: 1.5g</div>
                        <div>Omega-6: 3.5g</div>
                      </div>
                      
                      <div className="mt-6 text-sm">
                        <p>* Nutritional values may vary slightly based on ingredient batches and seasonal variations.</p>
                        <p>* Our recipes are formulated to meet AAFCO standards for adult dog maintenance.</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1624813743954-d32d824596df" 
                  alt="Healthy dog food ingredients" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ingredients;
