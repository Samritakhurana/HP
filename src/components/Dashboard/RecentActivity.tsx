import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Package, Activity } from 'lucide-react';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { format, formatDistanceToNow } from 'date-fns';

const RecentActivity: React.FC = () => {
  const { activityLogs, loading } = useActivityLogs(10);

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mark attendance':
        return Clock;
      case 'add product':
      case 'update product':
        return Package;
      case 'delete product':
        return AlertTriangle;
      case 'check out':
        return Clock;
      case 'create task':
      case 'update task status':
        return CheckCircle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mark attendance':
      case 'check out':
        return 'text-blue-600';
      case 'add product':
      case 'create task':
        return 'text-green-600';
      case 'update product':
      case 'update task status':
        return 'text-yellow-600';
      case 'delete product':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activityLogs.slice(0, 8).map((log) => {
          const IconComponent = getActivityIcon(log.action);
          return (
            <div key={log.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${getActivityColor(log.action)}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  {log.user?.full_name || 'Unknown User'} {log.action.toLowerCase()}
                </p>
                {log.details && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {log.details}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        {activityLogs.length === 0 && (
          <div className="text-center py-4">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
      <a href="/activity" className="block w-full mt-4 text-sm text-hp-blue hover:text-hp-dark-blue font-medium text-center">
        View All Activity
      </a>
    </div>
  );
};

export default RecentActivity;