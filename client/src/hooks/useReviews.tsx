import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export type Review = {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
  user?: {
    firstName: string;
    lastName: string;
  };
};

export type CreateReviewData = {
  productId: number;
  rating: number;
  comment: string;
  images?: string[];
};

export function useReviews(productId?: number) {
  const queryKey = productId 
    ? ['/api/reviews', { productId }]
    : ['/api/reviews'];

  return useQuery({
    queryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReview() {
  return useMutation({
    mutationFn: (data: CreateReviewData) => 
      apiRequest("POST", "/api/reviews", data)
        .then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    }
  });
}
