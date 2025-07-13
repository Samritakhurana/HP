import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthUser } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Clock,
  DollarSign,
  Package,
  Truck,
  FileText,
  BarChart3,
  CheckSquare,
  MessageSquare,
  Download,
  Users,
  Search,
  Activity
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Payroll', href: '/payroll', icon: DollarSign },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Orders', href: '/orders', icon: Truck },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Activity Log', href: '/activity', icon: Activity },
  { name: 'Export Data', href: '/export', icon: Download },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthUser();
  
  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter(item => {
    // Restrict payroll access to admin only
    if (item.href === '/payroll' && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hp-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HP</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                HP World
              </span>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-hp-blue text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;