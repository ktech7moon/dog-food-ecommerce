import { useCart, CartCustomization } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const CartSidebar = () => {
  const { cart, isCartOpen, closeCart, isLoading, updateItemQuantity, removeItem, getShipping, getTotal } = useCart();
  const { user, openLoginModal } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItemQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (!user) {
      closeCart();
      openLoginModal();
      toast({
        title: "Please sign in",
        description: "You need to be signed in to check out",
        duration: 3000,
      });
      return;
    }
    
    closeCart();
    navigate("/checkout");
  };

  const renderCustomizations = (customizations?: CartCustomization) => {
    if (!customizations) return null;
    
    return (
      <div className="text-xs text-gray-500 mt-1">
        {customizations.protein && <div>Protein: {customizations.protein}</div>}
        {customizations.size && <div>Size: {customizations.size}</div>}
        {customizations.purchaseType === "subscription" ? (
          <div>
            <div>Plan: Subscription</div>
            {customizations.frequency && <div>Delivery: {customizations.frequency}</div>}
          </div>
        ) : (
          <div>Plan: One-time purchase</div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Your Cart</h3>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {!cart || cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h4 className="font-bold text-xl mb-2">Your cart is empty</h4>
              <p className="text-gray-500 mb-6">Add some delicious meals for your pup!</p>
              <Button 
                className="bg-accent hover:bg-accent/90 text-white font-semibold rounded-full"
                onClick={() => {
                  closeCart();
                  navigate("/");
                }}
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex border rounded-lg p-3">
                  {item.product?.imageUrl && (
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-20 h-20 object-cover rounded" 
                    />
                  )}
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{item.product?.name}</h4>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                    {renderCustomizations(item.customizations)}
                    <div className="flex justify-between mt-2">
                      <div className="flex items-center border rounded">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isLoading}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold">
                        {item.customizations?.customPrice 
                          ? formatCurrency(item.customizations.customPrice * item.quantity) 
                          : item.product 
                            ? formatCurrency(item.product.price * item.quantity) 
                            : '$0.00'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span className="font-semibold">{formatCurrency(cart?.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Shipping:</span>
            <span className="font-semibold">{formatCurrency(getShipping())}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-lg font-bold mb-6">
            <span>Total:</span>
            <span>{formatCurrency(getTotal())}</span>
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full mb-2"
            onClick={handleCheckout}
            disabled={!cart || cart.items.length === 0 || isLoading}
          >
            Proceed to Checkout
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-2 border-gray-300 hover:bg-gray-50 font-semibold rounded-full"
            onClick={closeCart}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
