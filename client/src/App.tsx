import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useEffect } from "react";
import { fetchCsrfToken } from "./lib/csrf";
import Home from "@/pages/Home";
import Checkout from "@/pages/Checkout";
import Account from "@/pages/Account";
import OrderHistory from "@/pages/OrderHistory";
import AuthPage from "@/pages/auth-page";
import Welcome from "@/pages/Welcome";
import VerifyEmail from "@/pages/VerifyEmail";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import EnhancedAuthModal from "@/components/auth/EnhancedAuthModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/checkout" component={Checkout}/>
      <Route path="/account" component={Account}/>
      <Route path="/orders" component={OrderHistory}/>
      <Route path="/auth" component={AuthPage}/>
      <Route path="/welcome" component={Welcome}/>
      <Route path="/verify-email" component={VerifyEmail}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize CSRF protection when the app loads
  useEffect(() => {
    // Fetch an initial CSRF token on app start
    const initCsrfProtection = async () => {
      try {
        await fetchCsrfToken();
        console.log("Successfully initialized CSRF protection");
      } catch (error) {
        console.error("Failed to initialize CSRF protection:", error);
      }
    };
    
    initCsrfProtection();
    
    // Set up periodic token refresh (every 25 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        await fetchCsrfToken();
        console.log("Refreshed CSRF token");
      } catch (error) {
        console.error("Failed to refresh CSRF token:", error);
      }
    }, 25 * 60 * 1000); // 25 minutes
    
    // Clean up interval on component unmount
    return () => clearInterval(tokenRefreshInterval);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <Router />
            <Footer />
            <CartSidebar />
            <LoginModal />
            <SignupModal />
            <EnhancedAuthModalWithContext />
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Wrapper component to access auth context
function EnhancedAuthModalWithContext() {
  const { isEnhancedAuthModalOpen, closeEnhancedAuthModal, authModalTab } = useAuth();
  return (
    <EnhancedAuthModal 
      isOpen={isEnhancedAuthModalOpen} 
      onClose={closeEnhancedAuthModal}
      initialTab={authModalTab}
    />
  );
}

export default App;
