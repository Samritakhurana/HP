import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  type: 'user' | 'product' | 'order' | 'task';
  title: string;
  subtitle: string;
  data: any;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const searchResults: SearchResult[] = [];

      // Search users
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(5);

      users?.forEach(user => {
        searchResults.push({
          id: user.id,
          type: 'user',
          title: user.full_name,
          subtitle: user.email,
          data: user,
        });
      });

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(5);

      products?.forEach(product => {
        searchResults.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `SKU: ${product.sku} | Category: ${product.category}`,
          data: product,
        });
      });

      // Search orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
        .limit(5);

      orders?.forEach(order => {
        searchResults.push({
          id: order.id,
          type: 'order',
          title: `Order for ${order.customer_name}`,
          subtitle: `${order.customer_email} | ₹${order.total_amount}`,
          data: order,
        });
      });

      // Search tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assigned_to_fkey(full_name)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      tasks?.forEach(task => {
        searchResults.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `Assigned to: ${task.assignee?.full_name || 'Unknown'} | ${task.status}`,
          data: task,
        });
      });

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    search,
  };
};