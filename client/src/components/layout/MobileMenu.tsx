import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, openEnhancedAuthModal } = useAuth();

  const handleLinkClick = (isAuthRequired: boolean = false) => {
    if (isAuthRequired && !user) {
      openEnhancedAuthModal("login");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg">Menu</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:text-accent transition"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="space-y-3">
          <a 
            href="/#products" 
            className="block font-medium py-2 hover:text-accent transition"
            onClick={() => handleLinkClick()}
          >
            Products
          </a>
          <a 
            href="/#how-it-works" 
            className="block font-medium py-2 hover:text-accent transition"
            onClick={() => handleLinkClick()}
          >
            How It Works
          </a>
          <a 
            href="/#ingredients" 
            className="block font-medium py-2 hover:text-accent transition"
            onClick={() => handleLinkClick()}
          >
            Ingredients
          </a>
          <a 
            href="/#reviews" 
            className="block font-medium py-2 hover:text-accent transition"
            onClick={() => handleLinkClick()}
          >
            Reviews
          </a>
          <a 
            href="/#faq" 
            className="block font-medium py-2 hover:text-accent transition"
            onClick={() => handleLinkClick()}
          >
            FAQ
          </a>
          {user ? (
            <Link 
              href="/account" 
              className="block font-medium py-2 hover:text-accent transition"
              onClick={() => handleLinkClick()}
            >
              My Account
            </Link>
          ) : (
            <a 
              href="#" 
              className="block font-medium py-2 hover:text-accent transition"
              onClick={() => handleLinkClick(true)}
            >
              Sign In
            </a>
          )}
          {user && (
            <Link 
              href="/orders" 
              className="block font-medium py-2 hover:text-accent transition"
              onClick={() => handleLinkClick()}
            >
              My Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;