import React from 'react';
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { useProducts } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { useUsers } from '../hooks/useUsers';

const Analytics: React.FC = () => {
  const { attendance } = useAttendance();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { users } = useUsers();

  // Calculate analytics data
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.quantity <= (p.low_stock_threshold || 5)).length;
  
  // Attendance analytics
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    return recordDate === today;
  });
  const presentToday = todayAttendance.filter(record => record.status === 'present' || record.status === 'late').length;
  const attendanceRate = users.length > 0 ? Math.round((presentToday / users.length) * 100) : 0;

  // Calculate monthly data from actual database records
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      // Calculate revenue for this month
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === index && orderDate.getFullYear() === currentYear;
      });
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);
      
      // Calculate attendance rate for this month
      const monthAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === index && recordDate.getFullYear() === currentYear;
      });
      const presentCount = monthAttendance.filter(record => 
        record.status === 'present' || record.status === 'late'
      ).length;
      const totalRecords = monthAttendance.length;
      const attendancePercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
      
      return {
        month,
        revenue: monthRevenue,
        orders: monthOrders.length,
        attendance: attendancePercentage
      };
    });
  };

  const monthlyData = getMonthlyData();
  const currentMonthIndex = new Date().getMonth();
  const lastMonthRevenue = monthlyData[currentMonthIndex - 1]?.revenue || 0;
  const currentMonthRevenue = monthlyData[currentMonthIndex]?.revenue || 0;
  const revenueGrowth = lastMonthRevenue > 0 ? 
    Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% from last month
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
              <p className="text-xs text-blue-600 mt-1">
                {monthlyData[currentMonthIndex]?.orders || 0} this month
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
              <p className="text-xs text-purple-600 mt-1">Today's attendance</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
              <p className="text-xs text-red-600 mt-1">
                {lowStockProducts > 0 ? 'Needs attention' : 'All items in stock'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
              const widthPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              
              return (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{data.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{data.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Orders</h3>
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const maxOrders = Math.max(...monthlyData.map(d => d.orders));
              const widthPercentage = maxOrders > 0 ? (data.orders / maxOrders) * 100 : 0;
              
              return (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{data.month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${widthPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.orders}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {revenueGrowth >= 0 ? `${revenueGrowth}% increase` : `${Math.abs(revenueGrowth)}% decrease`} compared to last month
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {attendanceRate}% attendance rate today
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Status</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {totalProducts} total products, {lowStockProducts} need restocking
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Analytics</h3>
        <div className="space-y-4">
          {monthlyData.map((data, index) => {
            const maxAttendance = Math.max(...monthlyData.map(d => d.attendance));
            const widthPercentage = maxAttendance > 0 ? (data.attendance / maxAttendance) * 100 : 0;
            
            return (
            <div key={data.month} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{data.month}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${widthPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {data.attendance}%
                </span>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Advanced Analytics - Coming Soon</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Advanced analytics features including interactive charts, custom date ranges, and export capabilities 
              will be available soon. All current data is pulled directly from your database in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;