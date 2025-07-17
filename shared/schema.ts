import { pgTable, text, uuid, timestamp, integer, boolean, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  full_name: text("full_name").notNull(),
  role: text("role").notNull().default("employee"), // admin or employee
  store_id: uuid("store_id"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Stores table
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  date: date("date").notNull().defaultNow(),
  check_in: timestamp("check_in", { withTimezone: true }),
  check_out: timestamp("check_out", { withTimezone: true }),
  status: text("status").notNull().default("present"), // present, absent, late
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  sku: text("sku").notNull().unique(),
  quantity: integer("quantity").notNull().default(0),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  low_stock_threshold: integer("low_stock_threshold").notNull().default(5),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customer_name: text("customer_name").notNull(),
  customer_email: text("customer_email").notNull(),
  customer_phone: text("customer_phone").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, dispatched, delivered
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").notNull(),
  product_id: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  assigned_to: uuid("assigned_to").notNull(),
  assigned_by: uuid("assigned_by").notNull(),
  deadline: timestamp("deadline", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  priority: text("priority").notNull().default("medium"), // low, medium, high
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Payroll table
export const payroll = pgTable("payroll", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  base_salary: numeric("base_salary", { precision: 10, scale: 2 }).notNull().default("0"),
  bonus: numeric("bonus", { precision: 10, scale: 2 }).notNull().default("0"),
  total_salary: numeric("total_salary", { precision: 10, scale: 2 }).notNull().default("0"),
  days_worked: integer("days_worked").notNull().default(0),
  total_days: integer("total_days").notNull().default(30),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sender_id: uuid("sender_id").notNull(),
  receiver_id: uuid("receiver_id").notNull(),
  content: text("content").notNull(),
  is_read: boolean("is_read").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_number: text("invoice_number").notNull().unique(),
  customer_name: text("customer_name").notNull(),
  customer_company: text("customer_company"),
  customer_address: text("customer_address"),
  customer_phone: text("customer_phone"),
  customer_email: text("customer_email").notNull(),
  invoice_date: date("invoice_date").notNull(),
  due_date: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  tax_amount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("draft"), // draft, sent, paid, overdue
  payment_method: text("payment_method"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Invoice items table
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_id: uuid("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  store: one(stores, { fields: [users.store_id], references: [stores.id] }),
  attendance: many(attendance),
  assignedTasks: many(tasks, { relationName: "assigned_to" }),
  createdTasks: many(tasks, { relationName: "assigned_by" }),
  payroll: many(payroll),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  activityLogs: many(activityLogs),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, { fields: [attendance.user_id], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.order_id], references: [orders.id] }),
  product: one(products, { fields: [orderItems.product_id], references: [products.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, { fields: [tasks.assigned_to], references: [users.id], relationName: "assigned_to" }),
  assignedBy: one(users, { fields: [tasks.assigned_by], references: [users.id], relationName: "assigned_by" }),
}));

export const payrollRelations = relations(payroll, ({ one }) => ({
  user: one(users, { fields: [payroll.user_id], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.sender_id], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiver_id], references: [users.id], relationName: "receiver" }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, { fields: [activityLogs.user_id], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoice_id], references: [invoices.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  created_at: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  created_at: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  created_at: true,
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  created_at: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  created_at: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  created_at: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
