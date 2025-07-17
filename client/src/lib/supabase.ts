// This file has been migrated to client/src/lib/auth.ts
// All Supabase authentication functionality has been replaced with custom authentication
// that works with the new Neon PostgreSQL database and Drizzle ORM

export { signIn, signUp, signOut, getCurrentUser } from './auth';

// Legacy export for backward compatibility
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const result = await signIn(email, password);
      return { data: result.data, error: result.error };
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      const fullName = options?.data?.full_name || '';
      const role = options?.data?.role || 'employee';
      const result = await signUp(email, password, fullName, role);
      return { data: result.data, error: result.error };
    },
    signOut: async () => {
      const result = await signOut();
      return { error: result.error };
    },
    getUser: async () => {
      const user = await getCurrentUser();
      return { data: { user }, error: null };
    }
  },
  from: () => ({
    select: () => ({
      order: () => ({
        then: () => Promise.resolve({ data: [], error: null })
      })
    })
  })
};

export * from './auth';