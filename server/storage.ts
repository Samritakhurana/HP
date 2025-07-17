import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser,
  Store, InsertStore,
  Attendance, InsertAttendance,
  Product, InsertProduct,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  Task, InsertTask,
  Payroll, InsertPayroll,
  Message, InsertMessage,
  ActivityLog, InsertActivityLog,
  Invoice, InsertInvoice,
  InvoiceItem, InsertInvoiceItem
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Store management
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  getAllStores(): Promise<Store[]>;
  updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Attendance management
  getAttendance(id: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: string): Promise<boolean>;
  getAllAttendance(): Promise<Attendance[]>;
  getAttendanceByUser(userId: string): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;

  // Product management
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getAllProducts(): Promise<Product[]>;

  // Order management
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  getAllOrders(): Promise<Order[]>;

  // Order items management
  getOrderItem(id: string): Promise<OrderItem | undefined>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, updates: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;
  deleteOrderItem(id: string): Promise<boolean>;
  getOrderItemsByOrder(orderId: string): Promise<OrderItem[]>;

  // Task management
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getAllTasks(): Promise<Task[]>;
  getTasksByUser(userId: string): Promise<Task[]>;

  // Payroll management
  getPayroll(id: string): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: string, updates: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: string): Promise<boolean>;
  getAllPayroll(): Promise<Payroll[]>;
  getPayrollByUser(userId: string): Promise<Payroll[]>;

  // Message management
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message | undefined>;
  deleteMessage(id: string): Promise<boolean>;
  getAllMessages(): Promise<Message[]>;
  getMessagesByUser(userId: string): Promise<Message[]>;

  // Activity log management
  getActivityLog(id: string): Promise<ActivityLog | undefined>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  updateActivityLog(id: string, updates: Partial<InsertActivityLog>): Promise<ActivityLog | undefined>;
  deleteActivityLog(id: string): Promise<boolean>;
  getAllActivityLogs(): Promise<ActivityLog[]>;
  getActivityLogsByUser(userId: string): Promise<ActivityLog[]>;

  // Invoice management
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getAllInvoices(): Promise<Invoice[]>;

  // Invoice items management
  getInvoiceItem(id: string): Promise<InvoiceItem | undefined>;
  createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, updates: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: string): Promise<boolean>;
  getInvoiceItemsByInvoice(invoiceId: string): Promise<InvoiceItem[]>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(schema.users).where(eq(schema.users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users).orderBy(asc(schema.users.full_name));
  }

  // Store management
  async getStore(id: string): Promise<Store | undefined> {
    const result = await db.select().from(schema.stores).where(eq(schema.stores.id, id));
    return result[0];
  }

  async createStore(store: InsertStore): Promise<Store> {
    const result = await db.insert(schema.stores).values(store).returning();
    return result[0];
  }

  async getAllStores(): Promise<Store[]> {
    return await db.select().from(schema.stores).orderBy(asc(schema.stores.name));
  }

  async updateStore(id: string, updates: Partial<InsertStore>): Promise<Store | undefined> {
    const result = await db.update(schema.stores).set(updates).where(eq(schema.stores.id, id)).returning();
    return result[0];
  }

  async deleteStore(id: string): Promise<boolean> {
    const result = await db.delete(schema.stores).where(eq(schema.stores.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Attendance management
  async getAttendance(id: string): Promise<Attendance | undefined> {
    const result = await db.select().from(schema.attendance).where(eq(schema.attendance.id, id));
    return result[0];
  }

  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(schema.attendance).values(attendance).returning();
    return result[0];
  }

  async updateAttendance(id: string, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const result = await db.update(schema.attendance).set(updates).where(eq(schema.attendance.id, id)).returning();
    return result[0];
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const result = await db.delete(schema.attendance).where(eq(schema.attendance.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllAttendance(): Promise<Attendance[]> {
    return await db.select().from(schema.attendance).orderBy(desc(schema.attendance.date));
  }

  async getAttendanceByUser(userId: string): Promise<Attendance[]> {
    return await db.select().from(schema.attendance).where(eq(schema.attendance.user_id, userId)).orderBy(desc(schema.attendance.date));
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return await db.select().from(schema.attendance).where(eq(schema.attendance.date, date));
  }

  // Product management
  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(schema.products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(schema.products).set(updates).where(eq(schema.products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(schema.products).where(eq(schema.products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(schema.products).orderBy(asc(schema.products.name));
  }

  // Order management
  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(schema.orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const result = await db.update(schema.orders).set(updates).where(eq(schema.orders.id, id)).returning();
    return result[0];
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await db.delete(schema.orders).where(eq(schema.orders.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(schema.orders).orderBy(desc(schema.orders.created_at));
  }

  // Order items management
  async getOrderItem(id: string): Promise<OrderItem | undefined> {
    const result = await db.select().from(schema.orderItems).where(eq(schema.orderItems.id, id));
    return result[0];
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(schema.orderItems).values(orderItem).returning();
    return result[0];
  }

  async updateOrderItem(id: string, updates: Partial<InsertOrderItem>): Promise<OrderItem | undefined> {
    const result = await db.update(schema.orderItems).set(updates).where(eq(schema.orderItems.id, id)).returning();
    return result[0];
  }

  async deleteOrderItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.orderItems).where(eq(schema.orderItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(schema.orderItems).where(eq(schema.orderItems.order_id, orderId));
  }

  // Task management
  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id));
    return result[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(schema.tasks).values(task).returning();
    return result[0];
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db.update(schema.tasks).set(updates).where(eq(schema.tasks.id, id)).returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(schema.tasks).orderBy(desc(schema.tasks.created_at));
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await db.select().from(schema.tasks).where(eq(schema.tasks.assigned_to, userId)).orderBy(desc(schema.tasks.created_at));
  }

  // Payroll management
  async getPayroll(id: string): Promise<Payroll | undefined> {
    const result = await db.select().from(schema.payroll).where(eq(schema.payroll.id, id));
    return result[0];
  }

  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const result = await db.insert(schema.payroll).values(payroll).returning();
    return result[0];
  }

  async updatePayroll(id: string, updates: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const result = await db.update(schema.payroll).set(updates).where(eq(schema.payroll.id, id)).returning();
    return result[0];
  }

  async deletePayroll(id: string): Promise<boolean> {
    const result = await db.delete(schema.payroll).where(eq(schema.payroll.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllPayroll(): Promise<Payroll[]> {
    return await db.select().from(schema.payroll).orderBy(desc(schema.payroll.created_at));
  }

  async getPayrollByUser(userId: string): Promise<Payroll[]> {
    return await db.select().from(schema.payroll).where(eq(schema.payroll.user_id, userId)).orderBy(desc(schema.payroll.created_at));
  }

  // Message management
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(schema.messages).where(eq(schema.messages.id, id));
    return result[0];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(schema.messages).values(message).returning();
    return result[0];
  }

  async updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message | undefined> {
    const result = await db.update(schema.messages).set(updates).where(eq(schema.messages.id, id)).returning();
    return result[0];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(schema.messages).where(eq(schema.messages.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(schema.messages).orderBy(desc(schema.messages.created_at));
  }

  async getMessagesByUser(userId: string): Promise<Message[]> {
    return await db.select().from(schema.messages)
      .where(sql`${schema.messages.sender_id} = ${userId} OR ${schema.messages.receiver_id} = ${userId}`)
      .orderBy(desc(schema.messages.created_at));
  }

  // Activity log management
  async getActivityLog(id: string): Promise<ActivityLog | undefined> {
    const result = await db.select().from(schema.activityLogs).where(eq(schema.activityLogs.id, id));
    return result[0];
  }

  async createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(schema.activityLogs).values(activityLog).returning();
    return result[0];
  }

  async updateActivityLog(id: string, updates: Partial<InsertActivityLog>): Promise<ActivityLog | undefined> {
    const result = await db.update(schema.activityLogs).set(updates).where(eq(schema.activityLogs.id, id)).returning();
    return result[0];
  }

  async deleteActivityLog(id: string): Promise<boolean> {
    const result = await db.delete(schema.activityLogs).where(eq(schema.activityLogs.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.created_at));
  }

  async getActivityLogsByUser(userId: string): Promise<ActivityLog[]> {
    return await db.select().from(schema.activityLogs).where(eq(schema.activityLogs.user_id, userId)).orderBy(desc(schema.activityLogs.created_at));
  }

  // Invoice management
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    return result[0];
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(schema.invoices).values(invoice).returning();
    return result[0];
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await db.update(schema.invoices).set(updates).where(eq(schema.invoices.id, id)).returning();
    return result[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(schema.invoices).where(eq(schema.invoices.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(schema.invoices).orderBy(desc(schema.invoices.created_at));
  }

  // Invoice items management
  async getInvoiceItem(id: string): Promise<InvoiceItem | undefined> {
    const result = await db.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.id, id));
    return result[0];
  }

  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const result = await db.insert(schema.invoiceItems).values(invoiceItem).returning();
    return result[0];
  }

  async updateInvoiceItem(id: string, updates: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const result = await db.update(schema.invoiceItems).set(updates).where(eq(schema.invoiceItems.id, id)).returning();
    return result[0];
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.invoiceItems).where(eq(schema.invoiceItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getInvoiceItemsByInvoice(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(schema.invoiceItems).where(eq(schema.invoiceItems.invoice_id, invoiceId));
  }
}

export const storage = new DatabaseStorage();
