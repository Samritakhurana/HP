export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "employee";
  store_id?: string;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  check_in: string;
  check_out?: string;
  status: "present" | "absent" | "late";
  created_at: string;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string;
  deadline: string;
  status: "not_started" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  created_at: string;
  assignee?: User;
  assigner?: User;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  sku: string;
  description?: string;
  low_stock_threshold?: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: "pending" | "processing" | "dispatched" | "delivered";
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Payroll {
  id: string;
  user_id: string;
  month: string;
  year: number;
  base_salary: number;
  bonus: number;
  total_salary: number;
  days_worked: number;
  total_days: number;
  created_at: string;
  user?: User;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  user?: User;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_company?: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  payment_method?: string;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}
