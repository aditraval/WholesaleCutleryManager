import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, foreignKey, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Define roles enum
export const UserRole = {
  ADMIN: "admin",
  WHOLESALER: "wholesaler",
  GUEST: "guest"
} as const;

// Define pricing tier enum
export const PricingTier = {
  STANDARD: "standard",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise"
} as const;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default(UserRole.GUEST),
  companyName: text("company_name"),
  phoneNumber: text("phone_number"),
  country: text("country"),
  businessType: text("business_type"),
  contactName: text("contact_name"),
  createdAt: timestamp("created_at").defaultNow(),
  pricingTier: text("pricing_tier").default(PricingTier.STANDARD)
});

// Define user relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders)
}));

// Product Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description")
});

// Define category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull().unique(),
  basePrice: numeric("base_price").notNull(),
  inventory: integer("inventory").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: text("image_url")
});

// Define product relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  orderItems: many(orderItems),
  pricingItems: many(pricingTiers)
}));

// Pricing tiers table for different wholesaler pricing
export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  tier: text("tier").notNull().default(PricingTier.STANDARD),
  price: numeric("price").notNull(),
  minQuantity: integer("min_quantity").default(1)
}, (table) => {
  return {
    productTierUnique: uniqueIndex("product_tier_unique_idx").on(table.productId, table.tier)
  };
});

// Define pricing tier relations
export const pricingTiersRelations = relations(pricingTiers, ({ one }) => ({
  product: one(products, {
    fields: [pricingTiers.productId],
    references: [products.id]
  })
}));

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  notes: text("notes")
});

// Define order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  orderItems: many(orderItems)
}));

// Order Items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull()
});

// Define order items relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  status: text("status").notNull().default("unpaid"),
  issuedDate: timestamp("issued_date").defaultNow(),
  dueDate: timestamp("due_date"),
  amount: numeric("amount").notNull(),
  paymentMethod: text("payment_method")
});

// Define invoice relations
export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id]
  })
}));

// Wholesaler Requests table
export const wholesalerRequests = pgTable("wholesaler_requests", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  businessType: text("business_type").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  country: text("country").notNull(),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  companyName: true,
  phoneNumber: true,
  country: true,
  businessType: true,
  contactName: true,
  pricingTier: true
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  sku: true,
  basePrice: true,
  inventory: true,
  categoryId: true,
  imageUrl: true
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  notes: true
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  orderId: true,
  status: true,
  dueDate: true,
  amount: true
});

export const insertWholesalerRequestSchema = createInsertSchema(wholesalerRequests).pick({
  companyName: true,
  businessType: true,
  contactName: true,
  email: true,
  phoneNumber: true,
  country: true,
  message: true,
  status: true
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).pick({
  productId: true,
  tier: true,
  price: true,
  minQuantity: true
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type WholesalerRequest = typeof wholesalerRequests.$inferSelect;
export type InsertWholesalerRequest = z.infer<typeof insertWholesalerRequestSchema>;

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;
