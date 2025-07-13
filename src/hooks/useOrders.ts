import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchOrders = async (isLoadMore = false, limit = 50) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;
      
      if (isLoadMore) {
        setOrders(prev => [...prev, ...(data || [])]);
      } else {
        setOrders(data || []);
      }
      
      setHasMore((data || []).length === limit);
      setOffset(currentOffset + (data || []).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(true);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'items'> & { items: Omit<Order['items'][0], 'id' | 'order_id'>[] }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          status: orderData.status,
          total_amount: orderData.total_amount,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      if (orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          ...item,
          order_id: order.id,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Create Order',
          details: `Created order for ${orderData.customer_name}`,
        });

      await fetchOrders(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create order' };
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Update Order Status',
          details: `Updated order status to ${status}`,
        });

      await fetchOrders(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update order status' };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    addOrder,
    updateOrderStatus,
    refetch: () => fetchOrders(false),
  };
};