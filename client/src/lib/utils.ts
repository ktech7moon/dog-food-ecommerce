import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const dogSizeOptions = [
  { value: "small", label: "Small (5 lbs)", multiplier: 0.6, weight: 5 },
  { value: "medium", label: "Medium (20 lbs)", multiplier: 1.0, weight: 20 },
  { value: "large", label: "Large (40 lbs)", multiplier: 1.3, weight: 40 },
  { value: "xl", label: "Extra Large (80 lbs)", multiplier: 1.8, weight: 80 },
  { value: "custom", label: "Custom Size", multiplier: 0, weight: 0 }
];

export const deliveryFrequencyOptions = [
  { value: "weekly", label: "Weekly", multiplier: 1.0 },
  { value: "biweekly", label: "Bi-weekly", multiplier: 0.95 },
  { value: "monthly", label: "Monthly", multiplier: 0.9 },
];

export const purchaseTypes = [
  { value: "onetime", label: "Buy Now (One-time)" },
  { value: "subscription", label: "Buy with Subscription" }
];

export function calculateCustomPrice(
  basePrice: number, 
  sizeValue: string, 
  frequencyValue: string,
  customWeight: number = 0,
  purchaseType: string = "onetime"
): number {
  const size = dogSizeOptions.find(option => option.value === sizeValue);
  const frequency = deliveryFrequencyOptions.find(option => option.value === frequencyValue);
  
  if (!size || !frequency) return basePrice;
  
  let price = basePrice;
  
  // Handle custom weight calculation
  if (sizeValue === "custom" && customWeight > 0) {
    // Set a base multiplier of 0.5 for 5lbs, scaling linearly up to a max of 3.0 for 200lbs
    const weightMultiplier = 0.5 + ((customWeight - 5) / (200 - 5)) * 2.5;
    price = basePrice * weightMultiplier * frequency.multiplier;
  } else {
    price = basePrice * size.multiplier * frequency.multiplier;
  }
  
  // Apply subscription discount (15% off)
  if (purchaseType === "subscription") {
    price = price * 0.85; // 15% discount
  }
  
  return price;
}

export function calculateShipping(subtotal: number): number {
  // Free shipping for orders over $50
  if (subtotal >= 50) return 0;
  
  // Base shipping rate
  return 10;
}
