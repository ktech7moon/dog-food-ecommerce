import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export type CartCustomization = {
  protein: string;
  size: string;
  frequency: string;
  purchaseType?: string;
};

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  customizations?: CartCustomization;
  product?: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    protein: string;
    description: string;
  };
};

export type Cart = {
  id: number;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

interface CartContextType {
  cart: Cart | null;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: number, quantity?: number, customizations?: CartCustomization) => Promise<void>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getShipping: () => number;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else if (res.status !== 401) {
        // Don't show error for unauthorized (not logged in)
        console.error("Error fetching cart:", await res.text());
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = async (productId: number, quantity = 1, customizations?: CartCustomization) => {
    try {
      setIsLoading(true);
      
      await apiRequest("POST", "/api/cart/items", { 
        productId, 
        quantity,
        customizations
      });
      
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await fetchCart();
      
      toast({
        title: "Item added to cart",
        description: "Your item has been added to the cart",
        duration: 3000
      });
      
      openCart();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      
      await apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
      
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await fetchCart();
    } catch (error) {
      console.error("Error updating item quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      
      await apiRequest("DELETE", `/api/cart/items/${itemId}`, undefined);
      
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await fetchCart();
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
        duration: 3000
      });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      
      await apiRequest("DELETE", "/api/cart", undefined);
      
      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      await fetchCart();
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
        duration: 3000
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getShipping = (): number => {
    if (!cart) return 0;
    // Free shipping for orders over $50
    return cart.subtotal >= 50 ? 0 : 10;
  };

  const getTotal = (): number => {
    if (!cart) return 0;
    return cart.subtotal + getShipping();
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      isLoading,
      openCart,
      closeCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      getShipping,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
