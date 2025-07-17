import React, { useState } from 'react';
import { Clock, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useAttendance } from '../hooks/useAttendance';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

const Attendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const { attendance, loading, markAttendance, checkOut } = useAttendance();
  const { user } = useAuth();

  // Filter attendance by selected date
  const filteredAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    const matchesDate = recordDate === selectedDate;
    const matchesEmployee = selectedEmployee === 'all' || record.user_id === selectedEmployee;
    return matchesDate && matchesEmployee;
  });

  // Get unique employees for filter
  const employees = Array.from(
    new Map(attendance.map(record => [record.user?.id, record.user])).values()
  ).filter(Boolean);

  // Calculate stats for today
  const todayAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return recordDate === today;
  });

  const presentToday = todayAttendance.filter(record => record.status === 'present' || record.status === 'late').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;
  const totalEmployees = employees.length;

  // Export functionality
  const exportToCSV = () => {
    if (filteredAttendance.length === 0) {
      alert('No data to export for the selected date');
      return;
    }

    const headers = ['Employee Name', 'Email', 'Date', 'Status', 'Check In', 'Check Out', 'Working Hours'];
    const csvData = filteredAttendance.map(record => [
      record.user?.full_name || 'Unknown',
      record.user?.email || 'Unknown',
      record.date,
      record.status,
      record.check_in ? format(new Date(record.check_in), 'HH:mm:ss') : '-',
      record.check_out ? format(new Date(record.check_out), 'HH:mm:ss') : '-',
      calculateWorkingHours(record.check_in, record.check_out)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'absent':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'present':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'late':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'absent':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return baseClasses;
    }
  };

  const handleMarkAttendance = async () => {
    const result = await markAttendance();
    if (result.success) {
      alert('Attendance marked successfully!');
    } else {
      alert(result.error || 'Failed to mark attendance');
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return format(new Date(timestamp), 'hh:mm a');
  };

  const calculateWorkingHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hp-blue"></div>
      </div>
    );
  }

  // Check if user has already marked attendance today
  const userTodayAttendance = todayAttendance.find(record => record.user_id === user?.id);
  const hasMarkedToday = !!userTodayAttendance;
  const canCheckOut = hasMarkedToday && !userTodayAttendance?.check_out;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track daily attendance and work hours</p>
        </div>
        <button
          onClick={handleMarkAttendance}
          className="mt-4 sm:mt-0 bg-hp-blue hover:bg-hp-dark-blue text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Mark Attendance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
              <p className="text-2xl font-bold text-green-600">{presentToday.toString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent Today</p>
              <p className="text-2xl font-bold text-red-600">{absentToday.toString()}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600">{lateToday.toString()}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-2xl font-bold text-hp-blue">{totalEmployees.toString()}</p>
            </div>
            <Users className="w-8 h-8 text-hp-blue" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp?.id} value={emp?.id}>
                    {emp?.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button 
            onClick={exportToCSV}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attendance Records - {new Date(selectedDate).toLocaleDateString()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Working Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAttendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-hp-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {record.user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.user?.full_name || 'Unknown User'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={getStatusBadge(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatTime(record.check_in)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatTime(record.check_out)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {calculateWorkingHours(record.check_in, record.check_out)}
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No attendance records found for the selected date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions for Current User */}
      {!hasMarkedToday && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Mark Your Attendance</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You haven't marked your attendance for today yet.
              </p>
            </div>
            <button
              onClick={handleMarkAttendance}
              className="bg-hp-blue hover:bg-hp-dark-blue text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Mark Attendance
            </button>
          </div>
        </div>
      )}

      {canCheckOut && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Check Out</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                You checked in at {formatTime(userTodayAttendance?.check_in)}. Ready to check out?
              </p>
            </div>
            <button
              onClick={async () => {
                const result = await checkOut();
                if (result.success) {
                  alert('Checked out successfully!');
                } else {
                  alert(result.error || 'Failed to check out');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Check Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;