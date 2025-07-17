import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prevent changing admin role if it would result in no admin
      if (userData.role === 'employee') {
        const userToUpdate = users.find(u => u.id === id);
        if (userToUpdate?.role === 'admin') {
          throw new Error('Cannot change admin role. The system must have exactly one administrator.');
        }
      }

      // Prevent promoting to admin if one already exists
      if (userData.role === 'admin') {
        const existingAdmin = users.find(u => u.role === 'admin' && u.id !== id);
        if (existingAdmin) {
          throw new Error('Only one admin user is allowed in the system.');
        }
      }

      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Update User',
          details: `Updated user: ${userData.full_name || 'Unknown'}`,
        });

      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update user' };
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user name for logging
      const { data: targetUser } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'Delete User',
          details: `Deleted user: ${targetUser?.full_name || 'Unknown'}`,
        });

      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete user' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};