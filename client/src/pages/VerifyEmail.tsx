import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const VerifyEmail = () => {
  const [location, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  // Get token from URL query parameter
  const token = new URLSearchParams(window.location.search).get("token");
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. The token is missing.");
        return;
      }
      
      try {
        // This would be an actual API call in a real implementation
        // const res = await apiRequest("POST", "/api/auth/verify-email", { token });
        
        // For now, we'll just simulate a successful verification after a brief delay
        setTimeout(() => {
          setStatus("success");
          setMessage("Your email has been successfully verified. You can now enjoy all features of PawsomeMeals!");
        }, 1500);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Failed to verify email. The link may be expired or invalid.");
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Helmet>
        <title>Verify Email | PawsomeMeals</title>
      </Helmet>
      
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            Confirming your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center justify-center py-8">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-lg">Verifying your email address...</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-lg mb-4">
                {message}
              </p>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-center text-lg mb-4">
                {message}
              </p>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;