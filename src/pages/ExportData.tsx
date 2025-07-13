import React, { useState } from 'react';
import { Download, FileText, Calendar, Users, Package, Clock, CheckSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';

const ExportData: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any[], title: string, filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Date Range: ${dateRange.from} to ${dateRange.to}`, 20, 45);

    let yPosition = 60;
    const headers = Object.keys(data[0]);
    
    // Add headers
    doc.setFontSize(10);
    headers.forEach((header, index) => {
      doc.text(header, 20 + (index * 30), yPosition);
    });
    
    yPosition += 10;
    
    // Add data rows
    data.slice(0, 20).forEach((row) => { // Limit to 20 rows for PDF
      headers.forEach((header, index) => {
        const value = String(row[header] || '').substring(0, 15); // Truncate long values
        doc.text(value, 20 + (index * 30), yPosition);
      });
      yPosition += 8;
      
      if (yPosition > 270) { // Start new page if needed
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAttendance = async (format: 'csv' | 'pdf') => {
    setLoading('attendance');
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          date,
          check_in,
          check_out,
          status,
          user:users(full_name, email)
        `)
        .gte('date', dateRange.from)
        .lte('date', dateRange.to)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(record => ({
        Date: record.date,
        Employee: record.user?.full_name || 'Unknown',
        Email: record.user?.email || 'Unknown',
        'Check In': record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-',
        'Check Out': record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-',
        Status: record.status
      })) || [];

      if (format === 'csv') {
        exportToCSV(formattedData, 'attendance_report');
      } else {
        exportToPDF(formattedData, 'Attendance Report', 'attendance_report');
      }
    } catch (error) {
      alert('Failed to export attendance data');
    } finally {
      setLoading(null);
    }
  };

  const exportProducts = async (format: 'csv' | 'pdf') => {
    setLoading('products');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(product => ({
        Name: product.name,
        Category: product.category,
        SKU: product.sku,
        Quantity: product.quantity,
        Price: `₹${product.price}`,
        'Low Stock Threshold': product.low_stock_threshold,
        'Created At': new Date(product.created_at).toLocaleDateString()
      })) || [];

      if (format === 'csv') {
        exportToCSV(formattedData, 'products_report');
      } else {
        exportToPDF(formattedData, 'Products Report', 'products_report');
      }
    } catch (error) {
      alert('Failed to export products data');
    } finally {
      setLoading(null);
    }
  };

  const exportUsers = async (format: 'csv' | 'pdf') => {
    setLoading('users');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(user => ({
        'Full Name': user.full_name,
        Email: user.email,
        Role: user.role,
        'Created At': new Date(user.created_at).toLocaleDateString()
      })) || [];

      if (format === 'csv') {
        exportToCSV(formattedData, 'users_report');
      } else {
        exportToPDF(formattedData, 'Users Report', 'users_report');
      }
    } catch (error) {
      alert('Failed to export users data');
    } finally {
      setLoading(null);
    }
  };

  const exportActivityLogs = async (format: 'csv' | 'pdf') => {
    setLoading('activity');
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          action,
          details,
          created_at,
          user:users(full_name, email)
        `)
        .gte('created_at', `${dateRange.from}T00:00:00`)
        .lte('created_at', `${dateRange.to}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedData = data?.map(log => ({
        User: log.user?.full_name || 'Unknown',
        Email: log.user?.email || 'Unknown',
        Action: log.action,
        Details: log.details || '',
        'Date & Time': new Date(log.created_at).toLocaleString()
      })) || [];

      if (format === 'csv') {
        exportToCSV(formattedData, 'activity_logs_report');
      } else {
        exportToPDF(formattedData, 'Activity Logs Report', 'activity_logs_report');
      }
    } catch (error) {
      alert('Failed to export activity logs');
    } finally {
      setLoading(null);
    }
  };

  const exportCards = [
    {
      title: 'Attendance Report',
      description: 'Export employee attendance records',
      icon: Clock,
      color: 'blue',
      exportKey: 'attendance',
      exportFunction: exportAttendance
    },
    {
      title: 'Products Report',
      description: 'Export inventory and product data',
      icon: Package,
      color: 'green',
      exportKey: 'products',
      exportFunction: exportProducts
    },
    {
      title: 'Users Report',
      description: 'Export employee and user information',
      icon: Users,
      color: 'purple',
      exportKey: 'users',
      exportFunction: exportUsers
    },
    {
      title: 'Activity Logs',
      description: 'Export system activity and user actions',
      icon: CheckSquare,
      color: 'orange',
      exportKey: 'activity',
      exportFunction: exportActivityLogs
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Data</h1>
        <p className="text-gray-600 dark:text-gray-400">Download reports and data in various formats</p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Date Range</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportCards.map((card) => (
          <div key={card.exportKey} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(card.color)}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => card.exportFunction('csv')}
                disabled={loading === card.exportKey}
                className="flex-1 bg-hp-blue hover:bg-hp-dark-blue text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading === card.exportKey ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </>
                )}
              </button>
              <button
                onClick={() => card.exportFunction('pdf')}
                disabled={loading === card.exportKey}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading === card.exportKey ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Export Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Export Information</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
              <li>• PDF files are formatted for printing and sharing</li>
              <li>• Date range applies to attendance and activity logs only</li>
              <li>• Large datasets may take a few moments to process</li>
              <li>• All exports include data visible to your user role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportData;