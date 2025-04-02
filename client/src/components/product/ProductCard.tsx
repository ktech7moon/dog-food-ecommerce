import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    protein: string;
    price: number;
    imageUrl: string;
    isBestseller?: boolean;
    rating: number;
    reviewCount: number;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, isLoading } = useCart();

  const handleAddToCart = () => {
    addItem(product.id);
  };

  // Render stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>);
    }
    
    return stars;
  };

  return (
    <div className="bg-light rounded-xl shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={`${product.name} homemade dog food`} 
          className="w-full h-64 object-cover" 
        />
        {product.isBestseller && (
          <div className="absolute top-4 left-4 bg-primary text-white rounded-full px-4 py-1 text-sm font-semibold">
            Bestseller
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        <p className="mb-4">{product.description}</p>
        <div className="flex items-center mb-4">
          <div className="text-primary flex">
            {renderStars()}
          </div>
          <span className="ml-2 text-sm">({product.reviewCount} reviews)</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>
            <span className="text-sm ml-1">/ week</span>
          </div>
          <Button 
            onClick={handleAddToCart}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
