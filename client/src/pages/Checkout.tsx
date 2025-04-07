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
import { csrfRequest } from "@/lib/csrf";
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
import { loadStripe } from "@stripe/stripe-js";
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements, 
  AddressElement 
} from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Verify that we have a publishable key
if (!stripePublicKey) {
  console.error('Missing Stripe publishable key (VITE_STRIPE_PUBLIC_KEY)');
}

// Verify that it's a publishable key (starts with pk_)
if (stripePublicKey && !stripePublicKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key. It should start with "pk_"');
}

const stripePromise = loadStripe(stripePublicKey);

const shippingFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

// CheckoutForm component that contains the Stripe elements
const CheckoutForm = ({ 
  shippingInfo, 
  onSuccess 
}: { 
  shippingInfo: ShippingFormValues, 
  onSuccess: (orderId: number) => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const { toast } = useToast();
  const { cart, clearCart, getTotal } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !cart) {
      // Stripe.js hasn't yet loaded or cart is empty
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment through Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          // We'll handle this with a redirect flow in a real app
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred while processing your payment.",
          variant: "destructive",
          duration: 5000,
        });
        setIsProcessing(false);
        return;
      }

      // If we get here, payment was successful
      // Create the order
      const orderData = {
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingState: shippingInfo.state,
        shippingZip: shippingInfo.zipCode,
        shippingCountry: shippingInfo.country,
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.customizations?.customPrice || item.product?.price || 0,
          customizations: item.customizations
        }))
      };
      
      // Use csrfRequest instead of apiRequest for CSRF protection
      const response = await csrfRequest("POST", "/api/orders", orderData);
      const order = await response.json();
      
      // Clear the cart
      await clearCart();
      
      // Success! Call the onSuccess callback with the order ID
      onSuccess(order.id);
      
    } catch (error: any) {
      console.error("Error processing payment:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>Secure Payment</span>
          </div>
        </div>
        
        <PaymentElement />
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {errorMessage}
            </div>
          </div>
        )}
      </div>
      
      <Button 
        disabled={isProcessing || !stripe || !elements} 
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full py-3"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {cart && formatCurrency(getTotal())}
          </span>
        )}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const [isShippingFormComplete, setIsShippingFormComplete] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { cart, getShipping, getTotal } = useCart();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [shippingInfo, setShippingInfo] = useState<ShippingFormValues | null>(null);
  
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
  
  // Shipping form setup
  const shippingForm = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      country: user?.country || "USA",
      email: user?.email || "",
    },
  });
  
  useEffect(() => {
    // Update form values when user data is available
    if (user) {
      shippingForm.setValue("firstName", user.firstName || "");
      shippingForm.setValue("lastName", user.lastName || "");
      shippingForm.setValue("address", user.address || "");
      shippingForm.setValue("city", user.city || "");
      shippingForm.setValue("state", user.state || "");
      shippingForm.setValue("zipCode", user.zipCode || "");
      shippingForm.setValue("country", user.country || "USA");
      shippingForm.setValue("email", user.email || "");
    }
  }, [user, shippingForm]);

  // Handle Shipping form submission
  const onShippingSubmit = async (values: ShippingFormValues) => {
    try {
      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }
      
      // Save shipping info for later
      setShippingInfo(values);
      
      // Create a payment intent from the cart
      console.log("Sending payment intent request to API...");
      // Use csrfRequest instead of apiRequest for CSRF protection
      const response = await csrfRequest("POST", "/api/create-payment-intent-from-cart", {});
      
      // Check if the response was OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Payment intent API error:", errorData);
        throw new Error(errorData.error || errorData.message || "Payment setup failed");
      }
      
      const data = await response.json();
      console.log("Payment intent created successfully:", { clientSecret: data.clientSecret ? "Exists" : "Missing" });
      
      if (!data.clientSecret) {
        throw new Error("No client secret returned from server");
      }
      
      // Set the client secret to initialize Stripe Elements
      setClientSecret(data.clientSecret);
      
      // Move to payment step
      setIsShippingFormComplete(true);
      
    } catch (error: any) {
      console.error("Error setting up payment:", error);
      
      toast({
        title: "Payment Setup Error",
        description: error.message || "There was a problem setting up your payment. The Stripe integration may be misconfigured.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  // Handle successful payment and order creation
  const handlePaymentSuccess = (newOrderId: number) => {
    setOrderId(newOrderId);
    setIsOrderPlaced(true);
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
          
          {/* First step: Shipping information */}
          {!isShippingFormComplete && (
            <Form {...shippingForm}>
              <form onSubmit={shippingForm.handleSubmit(onShippingSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={shippingForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shippingForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shippingForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shippingForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shippingForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={shippingForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shippingForm.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={shippingForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full py-3"
                >
                  Continue to Payment
                </Button>
              </form>
            </Form>
          )}
          
          {/* Second step: Payment information */}
          {isShippingFormComplete && clientSecret && shippingInfo && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Shipping Information</h3>
                  <div className="text-sm text-gray-600">
                    <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p>{shippingInfo.address}</p>
                    <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                    <p>{shippingInfo.country}</p>
                    <p>{shippingInfo.email}</p>
                  </div>
                  <Button
                    variant="link"
                    className="text-sm p-0 mt-2"
                    onClick={() => setIsShippingFormComplete(false)}
                  >
                    Edit
                  </Button>
                </div>
                
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    shippingInfo={shippingInfo} 
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart?.items.map((item) => (
                <div key={item.id} className="flex justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                      {item.customizations && (
                        <span> | {item.customizations.size} | {item.customizations.protein}</span>
                      )}
                    </p>
                  </div>
                  <p className="font-medium">
                    {item.customizations?.customPrice 
                      ? formatCurrency(item.customizations.customPrice * item.quantity) 
                      : formatCurrency((item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-2 pb-4 border-b border-gray-200">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p className="font-medium">{cart && formatCurrency(cart.subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping</p>
                <p className="font-medium">{formatCurrency(getShipping())}</p>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 pb-2">
              <p className="font-bold">Total</p>
              <p className="font-bold text-lg">{formatCurrency(getTotal())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;