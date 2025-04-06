import { 
  User, InsertUser, 
  Product, InsertProduct,
  ProductSize, InsertProductSize,
  Review, InsertReview,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Cart, InsertCart, 
  CartItem, InsertCartItem,
  FAQ, InsertFAQ,
  ContactSubmission, InsertContactSubmission,
  NewsletterSubscriber, InsertNewsletterSubscriber,
  users, products, productSizes, reviews, orders, orderItems, carts, cartItems, faqs, contactSubmissions, newsletterSubscribers
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import createMemoryStore from "memorystore";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateUserAvatar(id: number, avatarUrl: string, usesDogAvatar: boolean): Promise<User | undefined>;
  updateUserTheme(id: number, theme: string): Promise<User | undefined>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  
  // Product Sizes
  getProductSizes(): Promise<ProductSize[]>;
  getProductSize(id: number): Promise<ProductSize | undefined>;
  createProductSize(size: InsertProductSize): Promise<ProductSize>;
  
  // Reviews
  getReviews(): Promise<Review[]>;
  getProductReviews(productId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Orders
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Carts
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  
  // Cart Items
  getCartItems(cartId: number): Promise<CartItem[]>;
  getCartItem(cartId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // FAQs
  getFAQs(): Promise<FAQ[]>;
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  
  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Newsletter Subscribers
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  isEmailSubscribed(email: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Ensure all fields have appropriate default values to satisfy the type system
    const userToInsert = {
      ...user,
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      zipCode: user.zipCode || null,
      country: user.country || null,
      avatarUrl: user.avatarUrl || null,
      usesDogAvatar: user.usesDogAvatar || false,
      theme: user.theme || "light"
    };
    
    const [newUser] = await db.insert(users).values(userToInsert).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserAvatar(id: number, avatarUrl: string, usesDogAvatar: boolean): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ avatarUrl, usesDogAvatar })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateUserTheme(id: number, theme: string): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ theme })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Ensure all fields have appropriate default values
    const productToInsert = {
      ...product,
      isBestseller: product.isBestseller ?? false,
      rating: product.rating ?? 0,
      reviewCount: product.reviewCount ?? 0
    };
    
    const [newProduct] = await db.insert(products).values(productToInsert).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  // Product Sizes
  async getProductSizes(): Promise<ProductSize[]> {
    return await db.select().from(productSizes);
  }

  async getProductSize(id: number): Promise<ProductSize | undefined> {
    const [size] = await db.select().from(productSizes).where(eq(productSizes.id, id));
    return size;
  }

  async createProductSize(size: InsertProductSize): Promise<ProductSize> {
    const [newSize] = await db.insert(productSizes).values(size).returning();
    return newSize;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews);
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    // Ensure all fields have appropriate default values
    const reviewToInsert = {
      ...review,
      images: review.images || null
    };
    
    const [newReview] = await db.insert(reviews).values(reviewToInsert).returning();
    
    // Update product rating and review count
    const product = await this.getProduct(review.productId);
    if (product) {
      const productReviews = await this.getProductReviews(review.productId);
      const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      // Use null coalescing to handle potential null values
      const currentReviewCount = product.reviewCount ?? 0;
      
      await this.updateProduct(product.id, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: productReviews.length
      });
    }
    
    return newReview;
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const itemToInsert = {
      ...item,
      customizations: item.customizations || null  // Ensure customizations is not undefined
    };
    
    const [newItem] = await db.insert(orderItems).values(itemToInsert).returning();
    return newItem;
  }

  // Carts
  async getCart(userId: number): Promise<Cart | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    return cart;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }

  // Cart Items
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async getCartItem(cartId: number, productId: number): Promise<CartItem | undefined> {
    const [item] = await db.select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartId),
          eq(cartItems.productId, productId)
        )
      );
    return item;
  }

  async createCartItem(item: InsertCartItem): Promise<CartItem> {
    const itemToInsert = {
      ...item,
      customizations: item.customizations || null  // Ensure customizations is not undefined
    };
    
    const [newItem] = await db.insert(cartItems).values(itemToInsert).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    try {
      const result = await db.delete(cartItems).where(eq(cartItems.id, id));
      return !!result.rowCount && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting cart item:", error);
      return false;
    }
  }

  async clearCart(cartId: number): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    return true;
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    return await db.select().from(faqs).orderBy(faqs.order);
  }

  async createFAQ(faq: InsertFAQ): Promise<FAQ> {
    const [newFAQ] = await db.insert(faqs).values(faq).returning();
    return newFAQ;
  }

  // Contact Submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Newsletter Subscribers
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return newSubscriber;
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    const [subscriber] = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    return !!subscriber;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private productSizes: Map<number, ProductSize>;
  private reviews: Map<number, Review>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private faqs: Map<number, FAQ>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  private userId: number;
  private productId: number;
  private sizeId: number;
  private reviewId: number;
  private orderId: number;
  private orderItemId: number;
  private cartId: number;
  private cartItemId: number;
  private faqId: number;
  private contactId: number;
  private subscriberId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.productSizes = new Map();
    this.reviews = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.faqs = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscribers = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.sizeId = 1;
    this.reviewId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.cartId = 1;
    this.cartItemId = 1;
    this.faqId = 1;
    this.contactId = 1;
    this.subscriberId = 1;
    
    // Create an in-memory session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add sample products
    const chickenProduct: InsertProduct = {
      name: "Chicken Delight",
      description: "A perfect blend of tender chicken, quinoa, eggs, and fresh vegetables. Rich in protein and essential nutrients.",
      protein: "chicken",
      price: 24.99,
      imageUrl: "/chicken.jpg",
      isBestseller: true,
      rating: 5.0,
      reviewCount: 124
    };
    
    const beefProduct: InsertProduct = {
      name: "Beef Bonanza",
      description: "Hearty beef mixed with quinoa, eggs, and a colorful medley of vegetables. Perfect for active dogs.",
      protein: "beef",
      price: 26.99,
      imageUrl: "https://images.unsplash.com/photo-1615548086280-b7d26a5a8476",
      isBestseller: false,
      rating: 4.5,
      reviewCount: 98
    };
    
    const mixProduct: InsertProduct = {
      name: "Mixed Protein Blend",
      description: "The best of both worlds! A perfect combination of our chicken and beef recipes, providing varied protein sources and flavors.",
      protein: "mix",
      price: 28.99,
      imageUrl: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf",
      isBestseller: true,
      rating: 4.8,
      reviewCount: 73
    };
    
    this.createProduct(chickenProduct);
    this.createProduct(beefProduct);
    this.createProduct(mixProduct);
    
    // Add product sizes
    const sizes = [
      { name: "Small Dog", description: "5-15 lbs", priceMultiplier: 0.8 },
      { name: "Medium Dog", description: "16-40 lbs", priceMultiplier: 1.0 },
      { name: "Large Dog", description: "41-70 lbs", priceMultiplier: 1.3 },
      { name: "Extra Large Dog", description: "71+ lbs", priceMultiplier: 1.6 }
    ];
    
    sizes.forEach(size => this.createProductSize(size));
    
    // Add FAQs
    const faqs = [
      { 
        question: "How long does the food stay fresh?", 
        answer: "Our meals stay fresh for up to 5 days in the refrigerator. For longer storage, you can keep them in the freezer for up to 3 months. Each package has a \"best by\" date clearly marked.", 
        order: 1 
      },
      { 
        question: "Can I customize the ingredients for allergies?", 
        answer: "Yes! We offer customization options for dogs with special dietary needs or allergies. During the ordering process, you can specify allergies, and we'll adjust the recipe accordingly.", 
        order: 2 
      },
      { 
        question: "How much food does my dog need?", 
        answer: "The amount of food depends on your dog's weight, age, and activity level. During the ordering process, we'll recommend the right portion size based on your dog's profile. Each meal pack comes with clear feeding instructions.", 
        order: 3 
      },
      { 
        question: "What if my dog doesn't like the food?", 
        answer: "We offer a 100% satisfaction guarantee. If your dog doesn't love our food, contact us within 14 days of delivery, and we'll issue a full refund or work with you to find a recipe your pup will enjoy.", 
        order: 4 
      },
      { 
        question: "How does shipping work?", 
        answer: "We ship nationwide using insulated packaging to keep the food cold. Shipping costs are calculated based on your location. Orders over $50 qualify for free shipping. You'll receive tracking information once your order ships.", 
        order: 5 
      }
    ];
    
    faqs.forEach(faq => this.createFAQ(faq));
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Ensure all fields have appropriate default values to satisfy the type system
    const newUser: User = { 
      ...user, 
      id, 
      createdAt,
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      zipCode: user.zipCode || null,
      country: user.country || null,
      avatarUrl: user.avatarUrl || null,
      usesDogAvatar: user.usesDogAvatar || false,
      theme: user.theme || "light"
    };
    
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserAvatar(id: number, avatarUrl: string, usesDogAvatar: boolean): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      avatarUrl, 
      usesDogAvatar 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserTheme(id: number, theme: string): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { 
      ...existingUser, 
      theme
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    // Ensure all fields have appropriate default values
    const newProduct: Product = { 
      ...product, 
      id,
      isBestseller: product.isBestseller ?? false,
      rating: product.rating ?? 0,
      reviewCount: product.reviewCount ?? 0
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Product Sizes
  async getProductSizes(): Promise<ProductSize[]> {
    return Array.from(this.productSizes.values());
  }

  async getProductSize(id: number): Promise<ProductSize | undefined> {
    return this.productSizes.get(id);
  }

  async createProductSize(size: InsertProductSize): Promise<ProductSize> {
    const id = this.sizeId++;
    const newSize: ProductSize = { ...size, id };
    this.productSizes.set(id, newSize);
    return newSize;
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviews.values());
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.userId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const createdAt = new Date();
    
    // Ensure all fields have appropriate default values
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt,
      images: review.images || null
    };
    
    this.reviews.set(id, newReview);
    
    // Update product rating and review count
    const product = await this.getProduct(review.productId);
    if (product) {
      const reviews = await this.getProductReviews(review.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + review.rating;
      const averageRating = totalRating / (reviews.length + 1);
      
      await this.updateProduct(product.id, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: (product.reviewCount || 0) + 1 // Handle possibly null value
      });
    }
    
    return newReview;
  }

  // Orders
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const newOrder: Order = { ...order, id, createdAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;
    
    const updatedOrder = { ...existingOrder, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    // Ensure all fields have appropriate default values
    const newItem: OrderItem = { 
      ...item, 
      id,
      customizations: item.customizations || null
    };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  // Carts
  async getCart(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newCart: Cart = { ...cart, id, createdAt, updatedAt };
    this.carts.set(id, newCart);
    return newCart;
  }

  // Cart Items
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.cartId === cartId);
  }

  async getCartItem(cartId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      item => item.cartId === cartId && item.productId === productId
    );
  }

  async createCartItem(item: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemId++;
    // Ensure all fields have appropriate default values
    const newItem: CartItem = { 
      ...item, 
      id,
      customizations: item.customizations || null
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const existingItem = this.cartItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(cartId: number): Promise<boolean> {
    const items = await this.getCartItems(cartId);
    items.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // FAQs
  async getFAQs(): Promise<FAQ[]> {
    return Array.from(this.faqs.values()).sort((a, b) => a.order - b.order);
  }

  async createFAQ(faq: InsertFAQ): Promise<FAQ> {
    const id = this.faqId++;
    const newFAQ: FAQ = { ...faq, id };
    this.faqs.set(id, newFAQ);
    return newFAQ;
  }

  // Contact Submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.contactId++;
    const createdAt = new Date();
    const newSubmission: ContactSubmission = { ...submission, id, createdAt };
    this.contactSubmissions.set(id, newSubmission);
    return newSubmission;
  }

  // Newsletter Subscribers
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.subscriberId++;
    const createdAt = new Date();
    const newSubscriber: NewsletterSubscriber = { ...subscriber, id, createdAt };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async isEmailSubscribed(email: string): Promise<boolean> {
    return Array.from(this.newsletterSubscribers.values()).some(
      subscriber => subscriber.email === email
    );
  }
}

export const storage = new MemStorage();
