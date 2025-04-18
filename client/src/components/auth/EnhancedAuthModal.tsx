import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaFacebook, FaGoogle, FaXTwitter } from "react-icons/fa6";
import { SiAmazon } from "react-icons/si";
import { Separator } from "@/components/ui/separator";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

const EnhancedAuthModal = ({ isOpen, onClose, initialTab = "login" }: EnhancedAuthModalProps) => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Signup form
  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      onClose();
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      // Direct API call to avoid issues with confirmPassword
      const userData = {
        ...values
      };
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      // Parse response json
      const data = await res.json();
      
      // For debugging
      console.log("Registration response:", data);
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Instead of directly navigating, let's update the auth context
      // This ensures the user state is updated before any redirection
      if (data.user) {
        // Manually fetch user data using AuthContext
        try {
          // We need to get the fully hydrated user from the server
          const userResponse = await fetch('/api/auth/user', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (userResponse.ok) {
            console.log("Successfully fetched user data after registration");
            
            // Close the modal
            onClose();
            
            // If onboarding is needed, redirect to welcome page
            if (data.needsOnboarding) {
              console.log("Redirecting to welcome page with updated user state");
              setTimeout(() => {
                window.location.href = "/welcome";
              }, 500); // Small delay to ensure state is updated
            } else {
              // Otherwise, just reload to update the auth state
              console.log("No onboarding flag found, reloading page");
              window.location.reload();
            }
          } else {
            console.error("Failed to fetch user data after registration");
            throw new Error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fall back to a reload
          window.location.reload();
        }
      } else {
        // Close the modal
        onClose();
        console.log("No user data in response, reloading");
        window.location.reload();
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // This would be implemented when we integrate with actual social auth providers
    console.log(`Logging in with ${provider}`);
    alert(`${provider} login will be implemented in a future update.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === "login" ? "Welcome Back!" : "Join PawsomeMeals"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "login" 
              ? "Log in to your PawsomeMeals account" 
              : "Create an account to start ordering fresh dog meals"}
          </DialogDescription>
        </DialogHeader>

        <Tabs 
          defaultValue={initialTab} 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full rounded-md" 
              onClick={() => handleSocialLogin("Facebook")}
            >
              <FaFacebook className="w-5 h-5 text-blue-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full rounded-md"
              onClick={() => handleSocialLogin("Google")}
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full rounded-md"
              onClick={() => handleSocialLogin("X")}
            >
              <FaXTwitter className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-full rounded-md"
              onClick={() => handleSocialLogin("Amazon")}
            >
              <SiAmazon className="w-5 h-5 text-orange-500" />
            </Button>
          </div>

          <Separator className="my-4" />
          <p className="text-center text-sm text-gray-500 my-2">or continue with email</p>

          {/* Login Tab */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log In"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-gray-500 mt-2">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </div>

                <DialogFooter className="mt-6">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAuthModal;