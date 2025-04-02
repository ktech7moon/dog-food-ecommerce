import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { Helmet } from "react-helmet";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry must be in MM/YY format"),
  cardCvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardName: z.string().min(2, "Name on card must be at least 2 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const { cart, getShipping, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Redirect if cart is empty or user is not logged in
    if ((!cart || cart.items.length === 0) && !isOrderPlaced) {
      navigate("/");
      toast({
        title: "Your cart is empty",
        description: "Please add items to your cart before checking out.",
        duration: 3000,
      });
    }
    
    if (!user) {
      navigate("/");
      toast({
        title: "Please sign in",
        description: "You need to be signed in to check out.",
        duration: 3000,
      });
    }
  }, [cart, user, navigate, toast, isOrderPlaced]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      country: user?.country || "USA",
      email: user?.email || "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardName: "",
    },
  });
  
  useEffect(() => {
    // Update form values when user data is available
    if (user) {
      form.setValue("firstName", user.firstName || "");
      form.setValue("lastName", user.lastName || "");
      form.setValue("address", user.address || "");
      form.setValue("city", user.city || "");
      form.setValue("state", user.state || "");
      form.setValue("zipCode", user.zipCode || "");
      form.setValue("country", user.country || "USA");
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }
      
      // Process the card details (this would normally be done through a payment processor)
      // For this example, we'll mock a successful payment
      
      // Create the order
      const orderData = {
        shippingAddress: values.address,
        shippingCity: values.city,
        shippingState: values.state,
        shippingZip: values.zipCode,
        shippingCountry: values.country,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || 0,
          customizations: item.customizations
        }))
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      
      // Clear the cart
      await clearCart();
      
      // Show success message
      setIsOrderPlaced(true);
      setOrderId(order.id);
      
    } catch (error) {
      console.error("Error placing order:", error);
      
      toast({
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };
  
  // Handle card expiry input
  const handleCardExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    let formattedValue = value.replace(/[^\d]/g, "");
    
    if (formattedValue.length >= 3) {
      formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
    }
    
    form.setValue("cardExpiry", formattedValue);
  };

  if (isOrderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Helmet>
          <title>Order Confirmation | PawsomeMeals</title>
        </Helmet>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-600">Thank you for your order. Your pup is going to be so happy!</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-medium">Order Number: <span className="font-bold">{orderId}</span></p>
                <p className="text-sm text-gray-600">A confirmation email has been sent to your email address.</p>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p>Your order has been received and is being processed.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p>You will receive a shipping confirmation email when your order ships.</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <p>Your fresh dog food will be delivered according to your selected schedule.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full"
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={() => navigate("/orders")}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold rounded-full"
                >
                  View Order History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Checkout | PawsomeMeals</title>
      </Helmet>
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
      </Button>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex space-x-2">
                      <i className="fab fa-cc-visa text-blue-800 text-xl"></i>
                      <i className="fab fa-cc-mastercard text-red-700 text-xl"></i>
                      <i className="fab fa-cc-amex text-blue-600 text-xl"></i>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="cardName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name on Card</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            disabled={isSubmitting}
                            maxLength={19}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value);
                              e.target.value = formatted;
                              field.onChange(formatted.replace(/\s/g, ""));
                            }}
                            placeholder="•••• •••• •••• ••••"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cardExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              maxLength={5}
                              placeholder="MM/YY"
                              onChange={handleCardExpiry}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cardCvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              maxLength={4}
                              type="password"
                              placeholder="•••"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 pt-2 pb-4 md:hidden">
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-full py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : `Complete Order (${formatCurrency(getTotal())})`}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-4">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
                    {item.product?.imageUrl && (
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{item.product?.name}</h4>
                      <span className="font-semibold">
                        {item.product ? formatCurrency(item.product.price * item.quantity) : "$0.00"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      {item.customizations && (
                        <div className="text-xs mt-1">
                          {item.customizations.protein && <div>Protein: {item.customizations.protein}</div>}
                          {item.customizations.size && <div>Size: {item.customizations.size}</div>}
                          {item.customizations.frequency && <div>Delivery: {item.customizations.frequency}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cart?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(getShipping())}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              
              {getShipping() === 0 && (
                <div className="text-green-600 text-sm flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Free shipping applied</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 hidden md:block">
              <Button
                type="submit"
                form={form.formState.isValid ? form.formId : undefined}
                onClick={form.formState.isValid ? undefined : () => form.handleSubmit(onSubmit)()}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold rounded-full py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Complete Order"}
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                <span>Secure checkout powered by Stripe</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
