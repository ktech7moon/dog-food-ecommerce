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
  { value: "small", label: "Small Dog (5-15 lbs)", multiplier: 0.8 },
  { value: "medium", label: "Medium Dog (16-40 lbs)", multiplier: 1.0 },
  { value: "large", label: "Large Dog (41-70 lbs)", multiplier: 1.3 },
  { value: "xl", label: "Extra Large Dog (71+ lbs)", multiplier: 1.6 },
];

export const deliveryFrequencyOptions = [
  { value: "weekly", label: "Weekly", multiplier: 1.0 },
  { value: "biweekly", label: "Bi-weekly", multiplier: 0.95 },
  { value: "monthly", label: "Monthly", multiplier: 0.9 },
];

export function calculateCustomPrice(
  basePrice: number, 
  sizeValue: string, 
  frequencyValue: string
): number {
  const size = dogSizeOptions.find(option => option.value === sizeValue);
  const frequency = deliveryFrequencyOptions.find(option => option.value === frequencyValue);
  
  if (!size || !frequency) return basePrice;
  
  return basePrice * size.multiplier * frequency.multiplier;
}

export function calculateShipping(subtotal: number): number {
  // Free shipping for orders over $50
  if (subtotal >= 50) return 0;
  
  // Base shipping rate
  return 10;
}
