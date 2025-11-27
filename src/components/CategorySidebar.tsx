import React from 'react';
import { Package, CheckCircle, AlertTriangle, Wrench, X } from 'lucide-react';
import { CategoryTotals } from '../types/Equipment';

interface CategorySidebarProps {
  categories: CategoryTotals;
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
  isOpen,
  onClose
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const categoryList = Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));

  const statusOptions = [
    { key: 'all', label: 'All Status', icon: Package, color: 'text-gray-500' },
    { key: 'available', label: 'Available', icon: CheckCircle, color: 'text-green-500' },
    { key: 'in_use', label: 'In Use', icon: AlertTriangle, color: 'text-orange-500' },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-red-500' }
  ];

  return (
    <>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full">
          {/* Categories */}
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Categories
          </h3>

          <button
            onClick={() => {
              onCategoryChange('all');
              onClose();
            }}
            className={`w-full flex justify-between px-3 py-2 rounded-md text-sm ${
              selectedCategory === 'all'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <span>All Categories</span>
            <span className="text-xs text-gray-500">
              {categoryList.reduce((sum, [, t]) => sum + (t.count || 0), 0)}
            </span>
          </button>

          {categoryList.map(([cat, totals]) => (
            <button
              key={cat}
              onClick={() => {
                onCategoryChange(cat);
                onClose();
              }}
              className={`w-full block px-3 py-2 text-sm rounded-md mt-1 ${
                selectedCategory === cat
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between">
                <span>{cat}</span>
                <span className="text-xs text-gray-500">{totals.count || 0}</span>
              </div>

              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{formatNumber(totals.units || 0)} units</span>
                <span>{formatCurrency((totals as any).cost || 0)}</span>
              </div>
            </button>
          ))}

          {/* Status */}
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mt-6 mb-3">
            Status
          </h3>

          {statusOptions.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => {
                onStatusChange(key);
                onClose();
              }}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                selectedStatus === key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-4 w-4 mr-2 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default CategorySidebar;
