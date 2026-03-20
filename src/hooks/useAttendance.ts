import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Attendance } from '../types';

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          user:users(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      setAttendance(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const now = new Date();

      // ✅ Use local date (IST safe)
      const today = now.toLocaleDateString('en-CA');

      const checkInTime = now.toISOString();

      // ✅ Proper late logic (after 9:15 AM)
      const cutoff = new Date();
      cutoff.setHours(9, 15, 0, 0);

      const status = now > cutoff ? 'late' : 'present';

      const { error } = await supabase
        .from('attendance')
        .upsert(
          {
            user_id: user.id,
            date: today,
            check_in: checkInTime,
            status,
          },
          {
            onConflict: 'user_id,date',
          }
        );

      if (error) throw error;

      // ✅ Fixed template string
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'Mark Attendance',
        details: `Marked attendance as ${status} at ${now.toLocaleTimeString()}`,
      });

      await fetchAttendance();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to mark attendance',
      };
    }
  };

  const checkOut = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toLocaleDateString('en-CA');
      const checkOutTime = new Date().toISOString();

      const { error } = await supabase
        .from('attendance')
        .update({ check_out: checkOutTime })
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;

      // ✅ Fixed template string
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'Check Out',
        details: `Checked out at ${new Date().toLocaleTimeString()}`,
      });

      await fetchAttendance();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to check out',
      };
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return {
    attendance,
    loading,
    error,
    markAttendance,
    checkOut,
    refetch: fetchAttendance,
  };
};
