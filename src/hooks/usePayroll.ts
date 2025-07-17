import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Payroll } from '../types';

export const usePayroll = () => {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPayroll = async (isLoadMore = false, limit = 50) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;
      
      if (isLoadMore) {
        setPayroll(prev => [...prev, ...(data || [])]);
      } else {
        setPayroll(data || []);
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
      fetchPayroll(true);
    }
  };

  const addPayroll = async (payrollData: Omit<Payroll, 'id' | 'created_at' | 'user'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payroll')
        .insert(payrollData);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Process Payroll',
          details: `Processed payroll for ${payrollData.month} ${payrollData.year}`,
        });

      await fetchPayroll(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to process payroll' };
    }
  };

  const updatePayroll = async (id: string, payrollData: Partial<Payroll>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('payroll')
        .update(payrollData)
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Update Payroll',
          details: `Updated payroll record`,
        });

      await fetchPayroll(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update payroll' };
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return {
    payroll,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    addPayroll,
    updatePayroll,
    refetch: () => fetchPayroll(false),
  };
};