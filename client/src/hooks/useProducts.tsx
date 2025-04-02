import { useQuery } from "@tanstack/react-query";

export type Product = {
  id: number;
  name: string;
  description: string;
  protein: string;
  price: number;
  imageUrl: string;
  isBestseller: boolean;
  rating: number;
  reviewCount: number;
};

export type ProductSize = {
  id: number;
  name: string;
  description: string;
  priceMultiplier: number;
};

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useProductSizes() {
  return useQuery({
    queryKey: ['/api/product-sizes'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
