import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import MobileMenu from "./MobileMenu";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User, ShoppingCart, Menu } from "lucide-react";
import { UserAvatar } from "@/components/profile";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, openLoginModal, openEnhancedAuthModal, logout } = useAuth();
  const { cart, openCart } = useCart();
  const { resolvedTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background shadow-md border-b">
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
            {/* Theme toggle button */}
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserAvatar size="sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/account">
                    <DropdownMenuItem className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/orders">
                    <DropdownMenuItem className="cursor-pointer">
                      Orders
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex hover:text-accent transition"
                onClick={() => openEnhancedAuthModal("login")}
              >
                <User size={20} />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:text-accent transition"
              onClick={openCart}
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart?.itemCount || 0}
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu size={20} />
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
