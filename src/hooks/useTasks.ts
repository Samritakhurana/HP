import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchTasks = async (isLoadMore = false, limit = 50) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const currentOffset = isLoadMore ? offset : 0;
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:users!tasks_assigned_to_fkey(*),
          assigner:users!tasks_assigned_by_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) throw error;
      
      if (isLoadMore) {
        setTasks(prev => [...prev, ...(data || [])]);
      } else {
        setTasks(data || []);
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
      fetchTasks(true);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'assignee' | 'assigner'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          assigned_by: user.id,
        });

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Create Task',
          details: `Created task: ${taskData.title}`,
        });

      await fetchTasks(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create task' };
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Update Task Status',
          details: `Updated task status to ${status}`,
        });

      await fetchTasks(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update task status' };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get task title for logging
      const { data: task } = await supabase
        .from('tasks')
        .select('title')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Delete Task',
          details: `Deleted task: ${task?.title || 'Unknown'}`,
        });

      await fetchTasks(false);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete task' };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    addTask,
    updateTaskStatus,
    deleteTask,
    refetch: () => fetchTasks(false),
  };
};