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
  // Format numbers and currency for India (₹, lakh/crore grouping)
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const categoryList = Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0]));

  const statusOptions = [
    { key: 'all', label: 'All Status', icon: Package, color: 'text-gray-500' },
    { key: 'available', label: 'Available', icon: CheckCircle, color: 'text-green-500' },
    { key: 'in_use', label: 'In Use', icon: AlertTriangle, color: 'text-orange-500' },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-red-500' }
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Categories
          </h3>
          <nav className="space-y-1">
            <button
              onClick={() => {
                onCategoryChange('all');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Categories</span>
              <span className="text-xs text-gray-500">
                {categoryList.reduce((sum, [, totals]) => sum + (totals.count || 0), 0)}
              </span>
            </button>
            
            {categoryList.map(([category, totals]) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  onClose();
                }}
                className={`w-full flex flex-col px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{category}</span>
                  <span className="text-xs text-gray-500">{totals.count ?? 0}</span>
                </div>
                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-xs text-gray-500">
                    {formatNumber(totals.units ?? 0)} units
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {typeof (totals as any).cost === 'number' ? formatCurrency((totals as any).cost) : ''}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Status
          </h3>
          <nav className="space-y-1">
            {statusOptions.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => {
                  onStatusChange(key);
                  onClose();
                }}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedStatus === key
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-4 w-4 mr-2 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default CategorySidebar;
