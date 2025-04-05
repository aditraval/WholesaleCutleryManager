import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAdmin, requireWholesaler } from "./auth";
import { 
  insertWholesalerRequestSchema, 
  insertProductSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertInvoiceSchema, 
  insertPricingTierSchema,
  PricingTier
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);

  // put application routes here
  // prefix all routes with /api
  
  // Wholesaler Request routes
  app.post("/api/wholesaler-requests", async (req, res, next) => {
    try {
      const data = insertWholesalerRequestSchema.parse(req.body);
      const request = await storage.createWholesalerRequest(data);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/wholesaler-requests", requireAdmin, async (req, res, next) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.listWholesalerRequests(status);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/wholesaler-requests/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateWholesalerRequestStatus(id, status);
      if (!request) {
        return res.status(404).json({ message: "Wholesaler request not found" });
      }
      
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // Product routes
  app.post("/api/products", requireAdmin, async (req, res, next) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/products", async (req, res, next) => {
    try {
      const categoryId = req.query.categoryId 
        ? parseInt(req.query.categoryId as string) 
        : undefined;
      
      const products = await storage.listProducts(categoryId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.listCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  // Order routes
  app.post("/api/orders", requireWholesaler, async (req, res, next) => {
    try {
      const userId = (req.user as Express.User).id;
      const data = insertOrderSchema.parse({ ...req.body, userId });
      const order = await storage.createOrder(data);
      
      // Create order items
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          });
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/orders", async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      
      // For admin, get all orders or filter by userId
      if (user.role === "admin") {
        const userId = req.query.userId 
          ? parseInt(req.query.userId as string) 
          : undefined;
        
        const orders = await storage.listOrders(userId);
        return res.json(orders);
      }
      
      // For wholesaler, only get their own orders
      const orders = await storage.listOrders(user.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as Express.User;
      
      // Ensure wholesalers can only access their own orders
      if (user.role === "wholesaler" && order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(id);
      
      res.json({ ...order, items: orderItems });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/orders/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "approved", "shipped", "delivered", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Invoice routes
  app.post("/api/invoices", requireAdmin, async (req, res, next) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(data);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/invoices", async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      
      // For admin, get all invoices or filter by userId
      if (user.role === "admin") {
        const userId = req.query.userId 
          ? parseInt(req.query.userId as string) 
          : undefined;
        
        const invoices = await storage.listInvoices(userId);
        return res.json(invoices);
      }
      
      // For wholesaler, only get their own invoices
      const invoices = await storage.listInvoices(user.id);
      res.json(invoices);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/invoices/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const user = req.user as Express.User;
      
      // For wholesalers, we need to check ownership
      if (user.role === "wholesaler") {
        if (!invoice.orderId) {
          return res.status(403).json({ message: "Forbidden" });
        }
        
        const order = await storage.getOrder(invoice.orderId);
        if (!order || order.userId !== user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/invoices/:id/status", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["unpaid", "paid", "overdue", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const invoice = await storage.updateInvoiceStatus(id, status);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  });

  // Pricing tier routes
  app.post("/api/pricing-tiers", requireAdmin, async (req, res, next) => {
    try {
      const data = insertPricingTierSchema.parse(req.body);
      
      // Ensure referenced product exists
      const product = await storage.getProduct(data.productId);
      if (!product) {
        return res.status(400).json({ message: "Referenced product does not exist" });
      }
      
      const pricingTier = await storage.createPricingTier(data);
      res.status(201).json(pricingTier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pricing tier data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.get("/api/pricing-tiers", async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const productId = req.query.productId 
        ? parseInt(req.query.productId as string) 
        : undefined;
      
      // For admin, allow filtering by tier as well
      if (user.role === "admin") {
        const tier = req.query.tier as string | undefined;
        const pricingTiers = await storage.listPricingTiers(productId, tier);
        return res.json(pricingTiers);
      }
      
      // For wholesaler, only return pricing tiers matching their pricing tier
      // Make sure pricingTier is defined (it should be a string or undefined)
      // Use a fallback to "standard" tier if none is set
      const wholesalerTier = user.pricingTier || "standard";
      const pricingTiers = await storage.listPricingTiers(productId, wholesalerTier);
      res.json(pricingTiers);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/pricing-tiers/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const pricingTier = await storage.getPricingTier(id);
      
      if (!pricingTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      const user = req.user as Express.User;
      
      // Ensure wholesalers can only access their own pricing tier
      if (user.role === "wholesaler") {
        // Use a fallback to "standard" if not set
        const wholesalerTier = user.pricingTier || "standard";
        if (pricingTier.tier !== wholesalerTier) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      res.json(pricingTier);
    } catch (error) {
      next(error);
    }
  });
  
  app.patch("/api/pricing-tiers/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const pricingTier = await storage.updatePricingTier(id, req.body);
      
      if (!pricingTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      res.json(pricingTier);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/pricing-tiers/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePricingTier(id);
      
      if (!success) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // User management routes (admin only)
  app.get("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.listUsers(role);
      
      // Remove passwords from response
      const sanitizedUsers = users.map(({ password, ...user }) => user);
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow updating password through this endpoint
      const { password, ...userData } = req.body;
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
