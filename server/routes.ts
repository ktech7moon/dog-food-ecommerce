import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { z } from "zod";
import Stripe from "stripe";
import { insertUserSchema, insertContactSubmissionSchema, insertReviewSchema, CartCustomization } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "pawsome-meals-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 },
    store: new SessionStore({ checkPeriod: 86400000 }) // prune expired entries every 24h
  }));

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Middleware to check if user is logged in
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // AUTH ROUTES
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const userSchema = insertUserSchema.extend({
        confirmPassword: z.string()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
      });

      // Create a copy of the request body to modify if needed
      const userData = { ...req.body };
      
      // If username is not provided, generate it from email
      if (!userData.username) {
        userData.username = userData.email.split('@')[0];
      }

      const validatedData = userSchema.parse(userData);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Create empty cart for user
      await storage.createCart({ userId: user.id });

      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error logging in after registration' });
        }
        return res.status(201).json({ 
          message: 'User registered successfully',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return res.status(500).json({ message: 'Error registering user' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response, next: Function) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      return res.json({ message: 'Logout successful' });
    });
  });

  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = req.user as any;
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country
    });
  });

  app.put('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      
      // Update user in the database
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update the session with the new user data
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating session' });
        }
        
        // Return the updated user
        return res.json({
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          address: updatedUser.address,
          city: updatedUser.city,
          state: updatedUser.state,
          zipCode: updatedUser.zipCode,
          country: updatedUser.country
        });
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'Error updating user' });
    }
  });

  // PRODUCT ROUTES
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product' });
    }
  });

  // PRODUCT SIZES ROUTES
  app.get('/api/product-sizes', async (req: Request, res: Response) => {
    try {
      const sizes = await storage.getProductSizes();
      res.json(sizes);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching product sizes' });
    }
  });

  // REVIEWS ROUTES
  app.get('/api/reviews', async (req: Request, res: Response) => {
    try {
      const { productId } = req.query;
      
      if (productId) {
        const reviews = await storage.getProductReviews(parseInt(productId as string));
        return res.json(reviews);
      }
      
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating review' });
    }
  });

  // CART ROUTES
  app.get('/api/cart', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      let cart = await storage.getCart(user.id);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId: user.id });
      }
      
      const cartItems = await storage.getCartItems(cart.id);
      
      // Get product details for each cart item
      const cartItemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({
        id: cart.id,
        items: cartItemsWithProducts,
        itemCount: cartItems.length,
        subtotal: cartItemsWithProducts.reduce((sum, item) => {
          // Use the custom price if available, otherwise use the product price
          const customizations = (item.customizations as any) || {};
          const itemPrice = customizations.customPrice ?? (item.product?.price || 0);
          return sum + itemPrice * item.quantity;
        }, 0)
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching cart' });
    }
  });

  app.post('/api/cart/items', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      let cart = await storage.getCart(user.id);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({ userId: user.id });
      }
      
      const { productId, quantity = 1, customizations } = req.body;
      
      // Validate product exists
      const product = await storage.getProduct(parseInt(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Check if item already in cart
      const existingItem = await storage.getCartItem(cart.id, parseInt(productId));
      
      if (existingItem) {
        // Update existing item
        const updatedItem = await storage.updateCartItem(
          existingItem.id, 
          existingItem.quantity + quantity
        );
        return res.json(updatedItem);
      }
      
      // Add new item to cart
      const newItem = await storage.createCartItem({
        cartId: cart.id,
        productId: parseInt(productId),
        quantity,
        customizations
      });
      
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: 'Error adding item to cart' });
    }
  });

  app.put('/api/cart/items/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { quantity } = req.body;
      const id = parseInt(req.params.id);
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: 'Error updating cart item' });
    }
  });

  app.delete('/api/cart/items/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCartItem(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing item from cart' });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const cart = await storage.getCart(user.id);
      
      if (cart) {
        await storage.clearCart(cart.id);
      }
      
      res.json({ message: 'Cart cleared' });
    } catch (error) {
      res.status(500).json({ message: 'Error clearing cart' });
    }
  });

  // ORDER ROUTES
  app.get('/api/orders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const orders = await storage.getOrders(user.id);
      
      // Get items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          
          // Get product details for each item
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product
              };
            })
          );
          
          return {
            ...order,
            items: itemsWithProducts
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders' });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Ensure order belongs to user
      if (order.userId !== user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching order' });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { 
        shippingAddress, shippingCity, shippingState, 
        shippingZip, shippingCountry, items 
      } = req.body;
      
      // Validate required fields
      if (!shippingAddress || !shippingCity || !shippingState || !shippingZip || !shippingCountry) {
        return res.status(400).json({ message: 'Shipping information is required' });
      }
      
      if (!items || !items.length) {
        return res.status(400).json({ message: 'Order must contain at least one item' });
      }
      
      // Calculate order totals
      let subtotal = 0;
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with id ${item.productId} not found` });
        }
        
        // Use the custom price if available, otherwise use the product price
        const customizations = (item.customizations as any) || {};
        const itemPrice = customizations.customPrice ?? product.price;
        subtotal += itemPrice * item.quantity;
      }
      
      // Calculate shipping based on location and subtotal
      let shipping = 10; // Base shipping rate
      
      // Free shipping for orders over $50
      if (subtotal >= 50) {
        shipping = 0;
      }
      
      const total = subtotal + shipping;
      
      // Create order
      const order = await storage.createOrder({
        userId: user.id,
        subtotal,
        shipping,
        total,
        status: 'pending',
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry
      });
      
      // Create order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations
        });
      }
      
      // Clear user's cart after successful order
      const cart = await storage.getCart(user.id);
      if (cart) {
        await storage.clearCart(cart.id);
      }
      
      res.status(201).json({
        ...order,
        items
      });
    } catch (error) {
      res.status(500).json({ message: 'Error creating order' });
    }
  });

  // FAQ ROUTES
  app.get('/api/faqs', async (req: Request, res: Response) => {
    try {
      const faqs = await storage.getFAQs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching FAQs' });
    }
  });

  // CONTACT ROUTES
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      res.status(201).json({ 
        message: 'Thank you for your message! We will get back to you soon.',
        id: submission.id
      });
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Error submitting contact form' });
    }
  });

  // NEWSLETTER ROUTES
  app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      // Check if email already subscribed
      const isSubscribed = await storage.isEmailSubscribed(email);
      
      if (isSubscribed) {
        return res.json({ message: 'Email already subscribed' });
      }
      
      await storage.createNewsletterSubscriber({ email });
      
      res.status(201).json({ message: 'Successfully subscribed to newsletter' });
    } catch (error) {
      res.status(500).json({ message: 'Error subscribing to newsletter' });
    }
  });

  // SHIPPING CALCULATOR
  app.post('/api/shipping/calculate', async (req: Request, res: Response) => {
    try {
      const { subtotal, zipCode, country } = req.body;
      
      if (!subtotal) {
        return res.status(400).json({ message: 'Subtotal is required' });
      }
      
      // Free shipping for orders over $50
      if (subtotal >= 50) {
        return res.json({ shipping: 0 });
      }
      
      // Base shipping rate
      let shipping = 10;
      
      // Additional rate based on location
      if (country && country.toLowerCase() !== 'usa' && country.toLowerCase() !== 'united states') {
        shipping += 15; // International shipping
      } else if (zipCode) {
        // Example of location-based shipping adjustment
        // In a real app, you'd use a shipping API or database
        const firstDigit = zipCode.toString()[0];
        
        if (['9', '0'].includes(firstDigit)) {
          shipping += 5; // West and Northeast coast shipping adjustment
        }
      }
      
      res.json({ shipping });
    } catch (error) {
      res.status(500).json({ message: 'Error calculating shipping' });
    }
  });

  // STRIPE PAYMENT ROUTES
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Missing STRIPE_SECRET_KEY. Payment processing will not work.');
  }

  // Initialize Stripe with proper typing
  // The stripe-js package expects a specific version format that's compatible with their API
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripe = new Stripe(stripeSecretKey);

  // Create a payment intent for one-time purchases
  app.post('/api/create-payment-intent', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Invalid amount' });
      }
      
      // Create a payment intent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: 'usd',
        metadata: {
          userId: user.id.toString()
        },
        // For order tracking and webhook handling
        description: `Order for user ${user.email}`,
      });
      
      // Send the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        message: 'Error processing payment',
        error: error.message
      });
    }
  });

  // Create a payment intent from the current cart
  app.post('/api/create-payment-intent-from-cart', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      // Get user's cart
      const cart = await storage.getCart(user.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(cart.id);
      if (!cartItems.length) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // Calculate total amount
      let amount = 0;
      
      for (const item of cartItems) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with id ${item.productId} not found` });
        }
        
        // Use the custom price if available, otherwise use the product price
        const customizations = (item.customizations as any) || {};
        const itemPrice = customizations.customPrice ?? product.price;
        amount += itemPrice * item.quantity;
      }
      
      // Apply shipping
      let shipping = 10;
      
      // Free shipping for orders over $50
      if (amount >= 50) {
        shipping = 0;
      }
      
      // Add shipping to amount
      amount += shipping;
      
      // Create a payment intent with the cart total
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert dollars to cents
        currency: 'usd',
        metadata: {
          userId: user.id.toString(),
          cartId: cart.id.toString()
        },
        description: `Order for user ${user.email}`,
      });
      
      // Send the client secret to the client
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: amount
      });
    } catch (error: any) {
      console.error('Error creating payment intent from cart:', error);
      res.status(500).json({
        message: 'Error processing payment',
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
