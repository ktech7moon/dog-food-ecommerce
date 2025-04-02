import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import MobileMenu from "./MobileMenu";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, openLoginModal } = useAuth();
  const { cart, openCart } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center">
              <span className="mr-2 text-accent">
                <ShoppingBag size={24} />
              </span>
              PawsomeMeals
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/#products" className="font-medium hover:text-accent transition">Products</a>
            <a href="/#how-it-works" className="font-medium hover:text-accent transition">How It Works</a>
            <a href="/#ingredients" className="font-medium hover:text-accent transition">Ingredients</a>
            <a href="/#reviews" className="font-medium hover:text-accent transition">Reviews</a>
            <a href="/#faq" className="font-medium hover:text-accent transition">FAQ</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex hover:text-accent transition"
              onClick={user ? () => {} : openLoginModal}
            >
              <Link href={user ? "/account" : "#"}>
                <i className="fas fa-user"></i>
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:text-accent transition"
              onClick={openCart}
            >
              <i className="fas fa-shopping-cart"></i>
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart?.itemCount || 0}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-xl"
              onClick={toggleMobileMenu}
            >
              <i className="fas fa-bars"></i>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  );
};

export default Header;
