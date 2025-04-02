import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Home from "@/pages/Home";
import Checkout from "@/pages/Checkout";
import Account from "@/pages/Account";
import OrderHistory from "@/pages/OrderHistory";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/checkout" component={Checkout}/>
      <Route path="/account" component={Account}/>
      <Route path="/orders" component={OrderHistory}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
          </div>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
