// This is a test file to check the cart functionality
// It will not be used in the final application

import { apiRequest } from "./lib/queryClient";

// Function to test adding an item to the cart
async function testAddToCart() {
  try {
    // First, create a test user account
    const user = await apiRequest("POST", "/api/auth/register", {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123"
    });
    
    console.log("User created:", user);
    
    // Then try to add an item to the cart
    const cartItem = await apiRequest("POST", "/api/cart/items", {
      productId: 1,
      quantity: 1,
      customizations: {
        protein: "chicken",
        size: "medium",
        frequency: "weekly"
      }
    });
    
    console.log("Item added to cart:", cartItem);
    
    // Get the cart to verify the item was added
    const cart = await fetch('/api/cart', {
      credentials: 'include'
    });
    
    const cartData = await cart.json();
    console.log("Cart data:", cartData);
    
    return "Test completed successfully!";
  } catch (error) {
    console.error("Test failed:", error);
    return "Test failed!";
  }
}

// Uncomment this line to run the test
// testAddToCart().then(console.log);