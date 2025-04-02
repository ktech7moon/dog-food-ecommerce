import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-dark text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold flex items-center mb-4">
              <span className="mr-2 text-primary">
                <ShoppingBag size={24} />
              </span>
              <span className="text-white">PawsomeMeals</span>
            </Link>
            <p className="mb-4 text-gray-200">Nutritious, homemade dog food delivered to your doorstep. Because your best friend deserves the best food.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary transition">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/#products" className="text-gray-200 hover:text-primary transition">Our Products</a></li>
              <li><a href="/#how-it-works" className="text-gray-200 hover:text-primary transition">How It Works</a></li>
              <li><a href="/#ingredients" className="text-gray-200 hover:text-primary transition">Ingredients</a></li>
              <li><a href="/#founder-story" className="text-gray-200 hover:text-primary transition">Our Story</a></li>
              <li><a href="/#reviews" className="text-gray-200 hover:text-primary transition">Reviews</a></li>
              <li><a href="/#faq" className="text-gray-200 hover:text-primary transition">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/account" className="text-gray-200 hover:text-primary transition">My Account</Link></li>
              <li><a href="#" className="text-gray-200 hover:text-primary transition">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary transition">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-200 hover:text-primary transition">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4 text-white">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fas fa-envelope text-primary mt-1 mr-2"></i>
                <span className="text-gray-200">hello@pawsomemeals.com</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone text-primary mt-1 mr-2"></i>
                <span className="text-gray-200">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary mt-1 mr-2"></i>
                <span className="text-gray-200">123 Barker Street<br />Dogtown, CA 90210</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300">© 2023 PawsomeMeals. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="bg-white/15 rounded-md px-2 py-1 text-xs text-white">
              <i className="fab fa-cc-visa mr-1"></i>
              Visa
            </div>
            <div className="bg-white/15 rounded-md px-2 py-1 text-xs text-white">
              <i className="fab fa-cc-mastercard mr-1"></i>
              Mastercard
            </div>
            <div className="bg-white/15 rounded-md px-2 py-1 text-xs text-white">
              <i className="fab fa-cc-amex mr-1"></i>
              Amex
            </div>
            <div className="bg-white/15 rounded-md px-2 py-1 text-xs text-white">
              <i className="fab fa-cc-paypal mr-1"></i>
              PayPal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
