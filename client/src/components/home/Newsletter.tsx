import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { csrfRequest } from "@/lib/csrf";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof formSchema>;

const Newsletter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the CSRF token directly from cookie to check if it's there
      const cookies = document.cookie.split(';');
      let csrfCookie = null;
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
          csrfCookie = decodeURIComponent(value);
          break;
        }
      }
      
      console.log('Newsletter form submission', {
        email: values.email,
        hasCsrfCookie: !!csrfCookie,
        csrfCookieStart: csrfCookie ? csrfCookie.substring(0, 10) : 'none'
      });
      
      await csrfRequest("POST", "/api/newsletter/subscribe", values);
      
      form.reset();
      
      toast({
        title: "Subscribed!",
        description: "Thank you for joining our pack. You'll now receive updates and special offers.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      
      // If it's a CSRF error, let's try to refresh the token and try again
      if (error instanceof Error && error.message.includes('403')) {
        try {
          console.log("CSRF token refresh attempt initiated...");
          
          // Import the fetchCsrfToken function dynamically to avoid circular dependencies
          const { fetchCsrfToken } = await import('@/lib/csrf');
          
          // Refresh the token
          await fetchCsrfToken();
          console.log("CSRF token refreshed, retrying submission...");
          
          // Try the request again
          await csrfRequest("POST", "/api/newsletter/subscribe", values);
          
          form.reset();
          
          toast({
            title: "Subscribed!",
            description: "Thank you for joining our pack. You'll now receive updates and special offers.",
            duration: 5000,
          });
          
          // If we got here, we succeeded on retry
          return;
        } catch (retryError) {
          console.error("Retry also failed:", retryError);
          // Fall through to the error toast below
        }
      }
      
      toast({
        title: "Subscription Error",
        description: "There was a problem subscribing you to our newsletter. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Join Our Pack</h3>
          <p className="mb-6">Sign up to receive updates, special offers, and nutrition tips for your furry friend.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Your email address" 
                        className="p-3 border-2 border-gray-300 rounded-lg"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg px-6 py-3 whitespace-nowrap"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </Form>
          <p className="text-sm mt-4 text-gray-500">We respect your privacy and will never share your information. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
