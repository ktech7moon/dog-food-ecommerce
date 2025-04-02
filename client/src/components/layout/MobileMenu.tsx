import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user, openLoginModal } = useAuth();

  const handleLinkClick = (isAuthRequired: boolean = false) => {
    if (isAuthRequired && !user) {
      openLoginModal();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t">
      <div className="container mx-auto px-4 py-3 space-y-3">
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
  );
};

export default MobileMenu;
