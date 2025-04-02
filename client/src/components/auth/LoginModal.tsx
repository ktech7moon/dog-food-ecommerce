import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ShoppingBag } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, openSignupModal, login, isLoading } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await login(values.email, values.password);
  };

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={closeLoginModal}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="text-center mb-6">
          <span className="inline-block text-3xl text-accent mb-2">
            <ShoppingBag className="h-10 w-10 mx-auto" />
          </span>
          <h3 className="text-2xl font-bold">Welcome Back!</h3>
          <p className="text-gray-500">Sign in to your PawsomeMeals account</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe" 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <Label 
                      htmlFor="rememberMe" 
                      className="text-sm cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                )}
              />
              <a href="#" className="text-sm text-accent hover:underline">Forgot password?</a>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full py-3"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-accent hover:underline p-0"
                  onClick={openSignupModal}
                  disabled={isLoading}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginModal;
