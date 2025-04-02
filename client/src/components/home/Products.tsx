import { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import EnhancedMealPlan from "@/components/product/EnhancedMealPlan";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Products = () => {
  const { data: products, isLoading, error } = useProducts();

  const renderProductCards = () => {
    if (isLoading) {
      return Array(2).fill(0).map((_, index) => (
        <div key={index} className="bg-light rounded-xl shadow-lg overflow-hidden">
          <Skeleton className="w-full h-64" />
          <div className="p-6">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-between items-end">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className="col-span-2 text-center p-8">
          <p className="text-red-500">Error loading products. Please try again later.</p>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="col-span-2 text-center p-8">
          <p>No products available at the moment.</p>
        </div>
      );
    }

    return products.map((product) => (
      <ProductCard key={product.id} product={product} />
    ));
  };

  return (
    <section id="products" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Meal Plans</h2>
          <p className="max-w-2xl mx-auto text-lg">Choose the perfect meal plan for your furry friend. Each recipe is crafted with love and nutritionally balanced for your dog's health.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {renderProductCards()}
          
          {/* Enhanced Meal Plan with Custom Weight Slider */}
          <div className="md:col-span-2">
            <EnhancedMealPlan />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
