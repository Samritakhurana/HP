import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';

export const useActivityLogs = (limit = 20) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchActivityLogs = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          user:users(*)
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;

      if (isLoadMore) {
        setActivityLogs(prev => [...prev, ...(data || [])]);
      } else {
        setActivityLogs(data || []);
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
      fetchActivityLogs(true);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  return {
    activityLogs,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchActivityLogs(false),
  };
};