import { 
  users, type User, type InsertUser, 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  orders, type Order, type InsertOrder, 
  orderItems, type OrderItem, type InsertOrderItem,
  invoices, type Invoice, type InsertInvoice,
  wholesalerRequests, type WholesalerRequest, type InsertWholesalerRequest,
  pricingTiers, type PricingTier, type InsertPricingTier
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, sql, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { hashPassword } from "./auth";

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(role?: string): Promise<User[]>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySKU(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  listProducts(categoryId?: number): Promise<Product[]>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Pricing tier operations
  getPricingTier?(id: number): Promise<PricingTier | undefined>;
  createPricingTier?(tier: InsertPricingTier): Promise<PricingTier>;
  updatePricingTier?(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier | undefined>;
  listPricingTiers?(productId?: number, tier?: string): Promise<PricingTier[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  listCategories(): Promise<Category[]>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  listOrders(userId?: number): Promise<Order[]>;
  
  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Invoice operations
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceByOrder(orderId: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  listInvoices(userId?: number): Promise<Invoice[]>;
  
  // Wholesaler request operations
  getWholesalerRequest(id: number): Promise<WholesalerRequest | undefined>;
  createWholesalerRequest(request: InsertWholesalerRequest): Promise<WholesalerRequest>;
  updateWholesalerRequestStatus(id: number, status: string): Promise<WholesalerRequest | undefined>;
  listWholesalerRequests(status?: string): Promise<WholesalerRequest[]>;
  
  // Session store
  sessionStore: any; // Any type to avoid import issues
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
    
    // Initialize the database with test users if they don't exist
    this.seedInitialData().catch(error => {
      console.error("Failed to seed initial data:", error);
    });
  }
  
  private async seedInitialData() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        // Create admin user
        const hashedAdminPassword = await hashPassword("Admin123");
        await this.createUser({
          username: "admin",
          email: "admin@cutlerywholesale.com",
          password: hashedAdminPassword,
          role: "admin",
          companyName: "Cutlery Wholesale Admin",
          contactName: "Admin User",
          phoneNumber: "555-123-4567",
          country: "USA",
          businessType: "Administration"
        });
      }
      
      // Check if wholesaler user exists
      const wholesalerUser = await this.getUserByUsername("wholesaler");
      if (!wholesalerUser) {
        // Create wholesaler user
        const hashedWholesalerPassword = await hashPassword("Wholesaler123");
        await this.createUser({
          username: "wholesaler",
          email: "test@wholesaler.com",
          password: hashedWholesalerPassword,
          role: "wholesaler",
          companyName: "Test Restaurant Supplies",
          contactName: "Wholesaler User",
          phoneNumber: "555-987-6543",
          country: "USA",
          businessType: "Restaurant Supply"
        });
      }
      
      // Create categories if they don't exist
      const categoryResults = await db.select({ count: sql<number>`count(*)` }).from(categories);
      if (categoryResults[0].count === 0) {
        const defaultCategories = [
          { name: "Chef Knives", description: "Professional chef knives for precision cutting" },
          { name: "Flatware", description: "Premium flatware sets for fine dining" },
          { name: "Kitchen Tools", description: "Specialty kitchen tools for professional kitchens" }
        ];
        
        for (const category of defaultCategories) {
          await this.createCategory(category);
        }
      }
      
      console.log("Database initialized with default data if needed");
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }
  
  // User operations
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
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async listUsers(role?: string): Promise<User[]> {
    if (role) {
      return db.select().from(users).where(eq(users.role, role));
    }
    return db.select().from(users);
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async getProductBySKU(sku: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.sku, sku));
    return product;
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }
  
  async listProducts(categoryId?: number): Promise<Product[]> {
    if (categoryId) {
      return db.select().from(products).where(eq(products.categoryId, categoryId));
    }
    return db.select().from(products);
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return !!result;
  }
  
  // Pricing tier operations
  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    const [tier] = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
    return tier;
  }
  
  async createPricingTier(insertTier: InsertPricingTier): Promise<PricingTier> {
    const [tier] = await db.insert(pricingTiers).values(insertTier).returning();
    return tier;
  }
  
  async updatePricingTier(id: number, tierData: Partial<InsertPricingTier>): Promise<PricingTier | undefined> {
    const [updatedTier] = await db.update(pricingTiers)
      .set(tierData)
      .where(eq(pricingTiers.id, id))
      .returning();
    return updatedTier;
  }
  
  async listPricingTiers(productId?: number, tier?: string): Promise<PricingTier[]> {
    if (productId && tier) {
      return db.select().from(pricingTiers)
        .where(and(
          eq(pricingTiers.productId, productId),
          eq(pricingTiers.tier, tier)
        ));
    } else if (productId) {
      return db.select().from(pricingTiers).where(eq(pricingTiers.productId, productId));
    } else if (tier) {
      return db.select().from(pricingTiers).where(eq(pricingTiers.tier, tier));
    }
    return db.select().from(pricingTiers);
  }
  
  async deletePricingTier(id: number): Promise<boolean> {
    const result = await db.delete(pricingTiers).where(eq(pricingTiers.id, id));
    return !!result;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  
  async listCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  async listOrders(userId?: number): Promise<Order[]> {
    if (userId) {
      return db.select().from(orders).where(eq(orders.userId, userId));
    }
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  
  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(insertOrderItem).returning();
    return orderItem;
  }
  
  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async getInvoiceByOrder(orderId: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
    return invoice;
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values({
      ...insertInvoice,
      paymentMethod: null // Default value for the required field
    }).returning();
    return invoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db.update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }
  
  async listInvoices(userId?: number): Promise<Invoice[]> {
    if (userId) {
      const userOrders = await db.select({ id: orders.id })
        .from(orders)
        .where(eq(orders.userId, userId));
      
      const orderIds = userOrders.map(o => o.id);
      
      if (orderIds.length === 0) {
        return [];
      }
      
      return db.select()
        .from(invoices)
        .where(inArray(invoices.orderId, orderIds))
        .orderBy(desc(invoices.issuedDate));
    }
    
    return db.select()
      .from(invoices)
      .orderBy(desc(invoices.issuedDate));
  }
  
  // Wholesaler request operations
  async getWholesalerRequest(id: number): Promise<WholesalerRequest | undefined> {
    const [request] = await db.select().from(wholesalerRequests).where(eq(wholesalerRequests.id, id));
    return request;
  }
  
  async createWholesalerRequest(insertRequest: InsertWholesalerRequest): Promise<WholesalerRequest> {
    const [request] = await db.insert(wholesalerRequests).values(insertRequest).returning();
    return request;
  }
  
  async updateWholesalerRequestStatus(id: number, status: string): Promise<WholesalerRequest | undefined> {
    const [updatedRequest] = await db.update(wholesalerRequests)
      .set({ status })
      .where(eq(wholesalerRequests.id, id))
      .returning();
    return updatedRequest;
  }
  
  async listWholesalerRequests(status?: string): Promise<WholesalerRequest[]> {
    if (status) {
      return db.select().from(wholesalerRequests).where(eq(wholesalerRequests.status, status));
    }
    return db.select().from(wholesalerRequests).orderBy(desc(wholesalerRequests.createdAt));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();