import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Package, Truck, CheckSquare, Clock } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { results, loading, search } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, search]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'product':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'order':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-orange-600" />;
      default:
        return <SearchIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getResultBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (type) {
      case 'user':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'product':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'order':
        return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200`;
      case 'task':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const handleResultClick = (result: any) => {
    switch (result.type) {
      case 'user':
        navigate('/employees');
        break;
      case 'product':
        navigate('/inventory');
        break;
      case 'order':
        navigate('/orders');
        break;
      case 'task':
        navigate('/tasks');
        break;
      default:
        break;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search</h1>
        <p className="text-gray-600 dark:text-gray-400">Search across all data in the system</p>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Search for users, products, orders, tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-hp-blue"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {Object.keys(groupedResults).length === 0 && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
            </div>
          )}

          {Object.entries(groupedResults).map(([type, typeResults]) => (
            <div key={type} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {type}s ({typeResults.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {typeResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {result.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className={getResultBadge(result.type)}>
                        {result.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Users</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Search by name or email</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Products</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Search by name, SKU, or category</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Truck className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Orders</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Search by customer name or email</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckSquare className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tasks</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Search by title or description</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;