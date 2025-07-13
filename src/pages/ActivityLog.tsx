import React, { useEffect, useRef } from 'react';
import { Activity, User, Clock, AlertCircle, CheckCircle, Package, Trash2 } from 'lucide-react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { format } from 'date-fns';

const ActivityLog: React.FC = () => {
  const { activityLogs, loading, loadingMore, hasMore, loadMore } = useActivityLogs();
  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mark attendance':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'add product':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'update product':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'delete product':
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case 'check out':
        return <Clock className="w-5 h-5 text-purple-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'mark attendance':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'add product':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'update product':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'delete product':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'check out':
        return 'bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
        <p className="text-gray-600 dark:text-gray-400">Track all system activities and user actions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold text-hp-blue">{activityLogs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-hp-blue" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Activities</p>
              <p className="text-2xl font-bold text-green-600">
                {activityLogs.filter(log => {
                  const today = new Date().toDateString();
                  const logDate = new Date(log.created_at).toDateString();
                  return today === logDate;
                }).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(activityLogs.map(log => log.user_id)).size}
              </p>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {activityLogs.map((log, index) => (
              <div key={log.id} className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.user?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {log.action}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  {log.details && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hp-blue"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading more...</span>
              </div>
            )}
            
            {/* Intersection observer target */}
            <div ref={observerRef} className="h-1" />
            
            {!hasMore && activityLogs.length > 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No more activities to load</p>
              </div>
            )}
            
            {activityLogs.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No activities found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;