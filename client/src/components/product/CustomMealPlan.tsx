import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, calculateCustomPrice, dogSizeOptions, deliveryFrequencyOptions } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const CustomMealPlan = () => {
  const [protein, setProtein] = useState("chicken");
  const [size, setSize] = useState("medium");
  const [frequency, setFrequency] = useState("weekly");
  
  const { addItem, isLoading } = useCart();
  
  const basePrice = 29.99;
  const customPrice = calculateCustomPrice(basePrice, size, frequency);
  
  const handleCreateCustomPlan = () => {
    // Use the appropriate product ID based on the selected protein
    let productId = 1; // Default to Chicken Delight (ID 1)
    
    if (protein === "beef") {
      productId = 2; // Beef Bonanza (ID 2)
    } else if (protein === "mix") {
      productId = 3; // Mixed Protein Blend (ID 3)
    }
    
    addItem(productId, 1, { protein, size, frequency });
  };

  return (
    <div className="bg-gradient-to-r from-gray-100 to-primary/10 rounded-xl shadow-lg overflow-hidden relative mt-8">
      <div className="md:flex">
        <div className="md:w-1/3">
          <img 
            src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8" 
            alt="Custom meal plan for dogs" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="p-8 md:w-2/3">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">Custom Meal Plan</h3>
          <p className="mb-4">Tailor the perfect meal plan for your dog's specific needs. Choose your preferred protein, portion size, and delivery frequency.</p>
          <div className="bg-white rounded-lg p-5 mb-6">
            <h4 className="font-semibold mb-3">Customize Your Plan:</h4>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Choose Protein:</p>
              <RadioGroup 
                value={protein} 
                onValueChange={setProtein}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="chicken" id="chicken" className="sr-only peer" />
                  <Label
                    htmlFor="chicken"
                    className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                  >
                    Chicken
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="beef" id="beef" className="sr-only peer" />
                  <Label
                    htmlFor="beef"
                    className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                  >
                    Beef
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="mix" id="mix" className="sr-only peer" />
                  <Label
                    htmlFor="mix"
                    className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                  >
                    Mix (Both)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mb-4">
              <p className="font-medium mb-2">Portion Size:</p>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="w-full p-2 border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {dogSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <p className="font-medium mb-2">Delivery Frequency:</p>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-full p-2 border-2 border-gray-300 rounded-lg">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryFrequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-bold">{formatCurrency(customPrice)}</span>
              <span className="text-sm ml-1">/ {frequency.replace("ly", "")}</span>
              <p className="text-sm text-green-600 font-medium">Save 15% with subscription</p>
            </div>
            <Button 
              onClick={handleCreateCustomPlan}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8 py-3"
            >
              Create Custom Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMealPlan;
