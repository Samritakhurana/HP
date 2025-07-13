import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'task' | 'message' | 'low_stock' | 'attendance' | 'order';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const notificationsList: Notification[] = [];

      // Check for unread messages
      const { data: unreadMessages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, sender:users!messages_sender_id_fkey(full_name)')
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) {
        console.warn('Error fetching messages:', messagesError);
        // Continue with other notifications even if messages fail
      }

      if (unreadMessages && !messagesError) {
        unreadMessages.forEach(message => {
        notificationsList.push({
          id: `message_${message.id}`,
          type: 'message',
          title: 'New Message',
          message: `From ${message.sender?.full_name}: ${message.content.substring(0, 50)}...`,
          read: false,
          created_at: message.created_at
        });
        });
      }

      // Check for assigned tasks
      const { data: assignedTasks } = await supabase
        .from('tasks')
        .select('id, title, created_at, priority')
        .eq('assigned_to', user.id)
        .eq('status', 'not_started')
        .order('created_at', { ascending: false })
        .limit(3);

      assignedTasks?.forEach(task => {
        notificationsList.push({
          id: `task_${task.id}`,
          type: 'task',
          title: 'New Task Assigned',
          message: `${task.title} (Priority: ${task.priority})`,
          read: false,
          created_at: task.created_at
        });
      });

      // Check for low stock items (admin only)
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (userProfile && userProfile.role === 'admin') {
        const { data: lowStockProducts } = await supabase
          .from('products')
          .select('id, name, quantity, low_stock_threshold')
          .lte('quantity', 5)
          .limit(3);

        lowStockProducts?.forEach(product => {
          notificationsList.push({
            id: `stock_${product.id}`,
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${product.name} is running low (${product.quantity} remaining)`,
            read: false,
            created_at: new Date().toISOString()
          });
        });

        // Check for pending orders
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('id, customer_name, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3);

        pendingOrders?.forEach(order => {
          notificationsList.push({
            id: `order_${order.id}`,
            type: 'order',
            title: 'New Order',
            message: `Order from ${order.customer_name}`,
            read: false,
            created_at: order.created_at
          });
        });
      }

      // Sort by created_at
      notificationsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};