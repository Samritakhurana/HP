import React from 'react';
import { Users, Clock, Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { useAuthUser } from '../hooks/useAuth';
import { useAttendance } from '../hooks/useAttendance';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useUsers } from '../hooks/useUsers';

const Dashboard: React.FC = () => {
  const { attendance } = useAttendance();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { users } = useUsers();
  const { user } = useAuthUser();

  // Calculate today's stats
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === today;
  });

  const presentToday = todayAttendance.filter(record => 
    record.status === 'present' || record.status === 'late'
  ).length;

  const totalEmployees = users.length;

  const lowStockItems = products.filter(product => 
    product.quantity <= (product.low_stock_threshold || 5)
  ).length;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.full_name || user?.email || 'User'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={totalEmployees.toString()}
          icon={Users}
          color="blue"
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Today's Attendance"
          value={`${presentToday}/${totalEmployees}`}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems.toString()}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/attendance" className="p-4 bg-hp-blue hover:bg-hp-dark-blue text-white rounded-lg transition-colors duration-200 text-center block">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Mark Attendance</span>
          </a>
          <a href="/inventory" className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center block">
            <Package className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Add Product</span>
          </a>
          <a href="/analytics" className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center block">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">View Analytics</span>
          </a>
          <a href="/payroll" className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-center block">
            <DollarSign className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Process Payroll</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;