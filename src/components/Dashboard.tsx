import React from 'react';
import { Package, DollarSign, CheckCircle, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import { EquipmentStats } from '../types/Equipment';

interface DashboardProps {
  stats: EquipmentStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Equipment Types
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.totalEquipmentTypes)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Units
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.totalUnits)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Value
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalCost)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Available
                </dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatNumber(stats.statusTotals.available)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(stats.statusTotals.available)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">In Use</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(stats.statusTotals.in_use)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatNumber(stats.statusTotals.maintenance)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Overview</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryTotals)
              .sort((a, b) => b[1].cost - a[1].cost)
              .slice(0, 5)
              .map(([category, totals]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({totals.count} types, {totals.units} units)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(totals.cost)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;