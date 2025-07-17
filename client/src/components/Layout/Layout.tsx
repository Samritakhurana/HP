import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import Attendance from '../../pages/Attendance';
import Inventory from '../../pages/Inventory';
import Orders from '../../pages/Orders';
import Tasks from '../../pages/Tasks';
import Messages from '../../pages/Messages';
import Payroll from '../../pages/Payroll';
import Invoices from '../../pages/Invoices';
import Analytics from '../../pages/Analytics';
import ActivityLog from '../../pages/ActivityLog';
import Search from '../../pages/Search';
import Employees from '../../pages/Employees';
import ExportData from '../../pages/ExportData';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);

  const renderContent = () => {
    switch (location) {
      case '/dashboard':
        return <Dashboard />;
      case '/attendance':
        return <Attendance />;
      case '/inventory':
        return <Inventory />;
      case '/orders':
        return <Orders />;
      case '/tasks':
        return <Tasks />;
      case '/messages':
        return <Messages />;
      case '/payroll':
        return <Payroll />;
      case '/invoices':
        return <Invoices />;
      case '/analytics':
        return <Analytics />;
      case '/activity':
        return <ActivityLog />;
      case '/search':
        return <Search />;
      case '/employees':
        return <Employees />;
      case '/export':
        return <ExportData />;
      default:
        return <Dashboard />; // Default to dashboard
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;