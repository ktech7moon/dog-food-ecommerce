import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { UserAvatar, AvatarModal } from "@/components/profile";
import { UserCheck, Mail, Home, ShoppingBag, Camera, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Welcome = () => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [progress, setProgress] = useState(25);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Debug logging on component mount
  useEffect(() => {
    console.log("Welcome component mounted");
    console.log("User state:", user);
  }, []);
  
  // Calculate profile completion percentage
  useEffect(() => {
    if (!user) {
      console.log("No user found in Welcome page");
      return;
    }
    
    console.log("Calculating profile completion for user:", user);
    
    let completed = 1; // Start with 1 for having an account
    let total = 4; // Total number of steps
    
    if (emailVerified) completed++;
    if (user.avatarUrl) completed++;
    if (user.address) completed++;
    
    setProgress((completed / total) * 100);
  }, [user, emailVerified]);
  
  // Simulate email verification for demo purposes
  const handleVerifyEmail = () => {
    setEmailVerified(true);
    toast({
      title: "Email verified",
      description: "Your email has been successfully verified.",
    });
  };
  
  if (!user) {
    console.log("No user found, redirecting to home");
    navigate("/");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>Welcome to PawsomeMeals | Get Started</title>
      </Helmet>
      
      <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <UserAvatar size="lg" className="w-20 h-20" />
            <div>
              <CardTitle className="text-2xl">Welcome, {user.firstName}!</CardTitle>
              <CardDescription className="text-base mt-1">
                Your PawsomeMeals journey begins here. Let's get you set up for success.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-sm font-medium">
            <span>Profile Completion</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-6">Complete these steps to get started</h2>
      
      <div className="grid gap-6">
        {/* Step 1: Account Created */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Account Created</CardTitle>
              </div>
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Congratulations! Your PawsomeMeals account has been successfully created.
            </CardDescription>
          </CardContent>
        </Card>
        
        {/* Step 2: Verify Email */}
        <Card className={emailVerified ? "border-primary/20 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className={`h-5 w-5 ${emailVerified ? "text-primary" : ""}`} />
                <CardTitle className="text-lg">Verify Your Email</CardTitle>
              </div>
              {emailVerified && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              We've sent a verification email to <span className="font-medium">{user.email}</span>. 
              Please check your inbox and follow the instructions to verify your email address.
            </CardDescription>
            {!emailVerified && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleVerifyEmail} size="sm">
                  I've Verified My Email
                </Button>
                <Button variant="outline" size="sm">
                  Resend Verification Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Step 3: Customize Profile */}
        <Card className={user.avatarUrl ? "border-primary/20 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className={`h-5 w-5 ${user.avatarUrl ? "text-primary" : ""}`} />
                <CardTitle className="text-lg">Customize Your Profile</CardTitle>
              </div>
              {user.avatarUrl && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Choose a cute dog avatar or upload your own photo to personalize your profile.
            </CardDescription>
            {!user.avatarUrl && (
              <AvatarModal
                trigger={
                  <Button size="sm">
                    Choose Avatar
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
        
        {/* Step 4: Add Shipping Address */}
        <Card className={user.address ? "border-primary/20 bg-primary/5" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className={`h-5 w-5 ${user.address ? "text-primary" : ""}`} />
                <CardTitle className="text-lg">Add Shipping Information</CardTitle>
              </div>
              {user.address && <CheckCircle2 className="h-6 w-6 text-primary" />}
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Add your shipping address to make checkout faster when you place your first order.
            </CardDescription>
            {!user.address && (
              <Button 
                size="sm" 
                onClick={() => navigate("/account")}
              >
                Add Address
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Ready to explore?</h2>
        <p className="text-muted-foreground mb-6">
          Start by checking out our premium dog food options, carefully crafted with natural ingredients
          to keep your furry friend healthy and happy.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/account")}
            className="flex items-center gap-2"
          >
            Complete Your Profile
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;