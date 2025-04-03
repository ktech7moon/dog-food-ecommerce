import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  formatCurrency, 
  calculateCustomPrice, 
  dogSizeOptions, 
  deliveryFrequencyOptions,
  purchaseTypes
} from "@/lib/utils";
import { useCart, CartCustomization } from "@/context/CartContext";

const EnhancedMealPlan = () => {
  // State for configuration options
  const [protein, setProtein] = useState("chicken");
  const [size, setSize] = useState("medium");
  const [frequency, setFrequency] = useState("weekly");
  const [purchaseType, setPurchaseType] = useState("onetime");
  const [customWeight, setCustomWeight] = useState<number>(20);
  const [showCustomSize, setShowCustomSize] = useState(false);
  
  const { addItem, isLoading } = useCart();
  
  const basePrice = 29.99;
  const customPrice = calculateCustomPrice(
    basePrice, 
    size, 
    frequency, 
    customWeight,
    purchaseType
  );

  // Reset custom weight when changing size
  useEffect(() => {
    if (size === "custom") {
      setShowCustomSize(true);
    } else {
      setShowCustomSize(false);
      // Set custom weight to the corresponding weight of the selected size
      const selectedSize = dogSizeOptions.find(option => option.value === size);
      if (selectedSize) {
        setCustomWeight(selectedSize.weight);
      }
    }
  }, [size]);
  
  const handleAddToCart = () => {
    // Use the appropriate product ID based on the selected protein
    let productId = 1; // Default to Chicken Delight (ID 1)
    
    if (protein === "beef") {
      productId = 2; // Beef Bonanza (ID 2)
    } else if (protein === "mix") {
      productId = 3; // Mixed Protein Blend (ID 3)
    }
    
    // Create customization object based on purchase type
    const customizations: CartCustomization = {
      protein,
      size: size === "custom" ? `custom-${customWeight}lbs` : size,
      purchaseType
    };
    
    // Only include frequency for subscription purchases
    if (purchaseType === "subscription") {
      customizations.frequency = frequency;
    }
    
    addItem(productId, 1, customizations);
  };

  // Format custom weight display with "lbs"
  const formattedWeight = `${customWeight} lbs`;

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
          <p className="mb-4">Tailor the perfect meal plan for your dog's specific needs. Choose your preferred protein, portion size, and delivery schedule.</p>
          
          <Tabs defaultValue="onetime" className="w-full" onValueChange={setPurchaseType}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              {purchaseTypes.map(type => (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className="text-sm md:text-base"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {purchaseTypes.map(type => (
              <TabsContent key={type.value} value={type.value} className="mt-0">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Protein Selection */}
                      <div>
                        <p className="font-medium mb-2">Choose Protein:</p>
                        <RadioGroup 
                          value={protein} 
                          onValueChange={setProtein}
                          className="flex flex-wrap gap-3"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="chicken" id={`chicken-${type.value}`} className="sr-only peer" />
                            <Label
                              htmlFor={`chicken-${type.value}`}
                              className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                            >
                              Chicken
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="beef" id={`beef-${type.value}`} className="sr-only peer" />
                            <Label
                              htmlFor={`beef-${type.value}`}
                              className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                            >
                              Beef
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="mix" id={`mix-${type.value}`} className="sr-only peer" />
                            <Label
                              htmlFor={`mix-${type.value}`}
                              className="px-4 py-2 rounded-full border-2 border-primary bg-white peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-white cursor-pointer transition"
                            >
                              Mix (Both)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      {/* Portion Size Selection */}
                      <div>
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
                        
                        {/* Custom Weight Slider */}
                        {showCustomSize && (
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Custom Weight:</span>
                              <span className="font-medium text-primary">{formattedWeight}</span>
                            </div>
                            <Slider
                              value={[customWeight]}
                              min={5}
                              max={200}
                              step={1}
                              onValueChange={(value) => setCustomWeight(value[0])}
                              className="py-2"
                            />
                            <div className="flex justify-between">
                              <span className="text-xs">5 lbs</span>
                              <span className="text-xs">200 lbs</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Delivery Frequency */}
                      {type.value === "subscription" && (
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
                      )}
                      
                      {/* Price and Add to Cart Button */}
                      <div className="flex justify-between items-center pt-4">
                        <div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">{formatCurrency(customPrice)}</span>
                            {type.value === "subscription" && (
                              <span className="text-sm ml-1">/ {frequency.replace("ly", "")}</span>
                            )}
                          </div>
                          {type.value === "subscription" && (
                            <p className="text-sm text-green-600 font-medium">15% subscription savings applied</p>
                          )}
                        </div>
                        <Button 
                          onClick={handleAddToCart}
                          disabled={isLoading}
                          className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-6 py-2"
                        >
                          {type.value === "onetime" ? "Add to Cart" : "Subscribe Now"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMealPlan;