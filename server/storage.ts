import { 
  users, type User, type InsertUser, 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  orders, type Order, type InsertOrder, 
  orderItems, type OrderItem, type InsertOrderItem,
  invoices, type Invoice, type InsertInvoice,
  wholesalerRequests, type WholesalerRequest, type InsertWholesalerRequest
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// modify the interface with any CRUD methods
// you might need
const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private invoices: Map<number, Invoice>;
  private wholesalerRequests: Map<number, WholesalerRequest>;
  
  currentUserId: number;
  currentProductId: number;
  currentCategoryId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentInvoiceId: number;
  currentWholesalerRequestId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.invoices = new Map();
    this.wholesalerRequests = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentInvoiceId = 1;
    this.currentWholesalerRequestId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with categories and sample products
    this.seedInitialData();
  }
  
  private seedInitialData() {
    // Create categories
    const categories = [
      { name: "Chef Knives", description: "Professional chef knives for precision cutting" },
      { name: "Flatware", description: "Premium flatware sets for fine dining" },
      { name: "Kitchen Tools", description: "Specialty kitchen tools for professional kitchens" }
    ];
    
    categories.forEach(cat => this.createCategory(cat));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async listUsers(role?: string): Promise<User[]> {
    const allUsers = Array.from(this.users.values());
    if (role) {
      return allUsers.filter(user => user.role === role);
    }
    return allUsers;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySKU(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku,
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async listProducts(categoryId?: number): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    if (categoryId) {
      return allProducts.filter(product => product.categoryId === categoryId);
    }
    return allProducts;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  async listCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt, updatedAt };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async listOrders(userId?: number): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    if (userId) {
      return allOrders.filter(order => order.userId === userId);
    }
    return allOrders;
  }
  
  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  // Invoice operations
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoiceByOrder(orderId: number): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (invoice) => invoice.orderId === orderId,
    );
  }
  
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const issuedDate = new Date();
    const invoice: Invoice = { ...insertInvoice, id, issuedDate };
    this.invoices.set(id, invoice);
    return invoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, status };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async listInvoices(userId?: number): Promise<Invoice[]> {
    const allInvoices = Array.from(this.invoices.values());
    if (userId) {
      // Get all orders for this user
      const userOrders = Array.from(this.orders.values())
        .filter(order => order.userId === userId)
        .map(order => order.id);
      
      // Return invoices for those orders
      return allInvoices.filter(invoice => userOrders.includes(invoice.orderId));
    }
    return allInvoices;
  }
  
  // Wholesaler request operations
  async getWholesalerRequest(id: number): Promise<WholesalerRequest | undefined> {
    return this.wholesalerRequests.get(id);
  }
  
  async createWholesalerRequest(insertRequest: InsertWholesalerRequest): Promise<WholesalerRequest> {
    const id = this.currentWholesalerRequestId++;
    const createdAt = new Date();
    const request: WholesalerRequest = { ...insertRequest, id, createdAt };
    this.wholesalerRequests.set(id, request);
    return request;
  }
  
  async updateWholesalerRequestStatus(id: number, status: string): Promise<WholesalerRequest | undefined> {
    const request = this.wholesalerRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.wholesalerRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  async listWholesalerRequests(status?: string): Promise<WholesalerRequest[]> {
    const allRequests = Array.from(this.wholesalerRequests.values());
    if (status) {
      return allRequests.filter(request => request.status === status);
    }
    return allRequests;
  }
}

export const storage = new MemStorage();
