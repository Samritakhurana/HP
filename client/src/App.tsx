import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Tasks from './pages/Tasks';
import Messages from './pages/Messages';
import Payroll from './pages/Payroll';
import Invoices from './pages/Invoices';
import Analytics from './pages/Analytics';
import ActivityLog from './pages/ActivityLog';
import Search from './pages/Search';
import Employees from './pages/Employees';
import ExportData from './pages/ExportData';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - updated from cacheTime
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <Layout />;
};

// App routing component
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? (() => { window.location.href = "/dashboard"; return null; })() : <LoginForm />}
      </Route>
      <Route path="/">
        {user ? (() => { window.location.href = "/dashboard"; return null; })() : <LoginForm />}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute />
      </Route>
      <Route path="/attendance">
        <ProtectedRoute />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute />
      </Route>
      <Route path="/activity">
        <ProtectedRoute />
      </Route>
      <Route path="/search">
        <ProtectedRoute />
      </Route>
      <Route path="/employees">
        <ProtectedRoute />
      </Route>
      <Route path="/export">
        <ProtectedRoute />
      </Route>
      <Route path="/payroll">
        <ProtectedRoute />
      </Route>
      <Route path="/orders">
        <ProtectedRoute />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute />
      </Route>
      <Route path="/messages">
        <ProtectedRoute />
      </Route>
      <Route path="/invoices">
        <ProtectedRoute />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute />
      </Route>
    </Switch>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;