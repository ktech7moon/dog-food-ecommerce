import { useQuery } from "@tanstack/react-query";

export type FAQ = {
  id: number;
  question: string;
  answer: string;
  order: number;
};

export function useFAQs() {
  return useQuery({
    queryKey: ['/api/faqs'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
