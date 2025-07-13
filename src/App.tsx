import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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

  return user ? <Layout /> : <Navigate to="/login" />;
};

// Login Route Component
const LoginRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <LoginForm />;
};

// Create the router
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginRoute />
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "attendance",
        element: <Attendance />
      },
      {
        path: "inventory",
        element: <Inventory />
      },
      {
        path: "activity",
        element: <ActivityLog />
      },
      {
        path: "search",
        element: <Search />
      },
      {
        path: "employees",
        element: <Employees />
      },
      {
        path: "export",
        element: <ExportData />
      },
      {
        path: "payroll",
        element: <Payroll />
      },
      {
        path: "orders",
        element: <Orders />
      },
      {
        path: "tasks",
        element: <Tasks />
      },
      {
        path: "messages",
        element: <Messages />
      },
      {
        path: "invoices",
        element: <Invoices />
      },
      {
        path: "analytics",
        element: <Analytics />
      }
    ]
  }
]);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;