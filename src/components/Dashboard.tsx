import React from 'react';
import { Package, CheckCircle, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import { EquipmentStats } from '../types/Equipment';

interface DashboardProps {
  stats: EquipmentStats;
}

/**
 * Format a value as Indian Rupees (₹) using en-IN grouping.
 * - Accepts numbers or strings (will extract numeric part if string contains symbols).
 * - Always outputs a properly formatted ₹ value.
 */
const formatCurrencyINR = (value: number | string | undefined | null) => {
  let num = 0;
  if (value == null) num = 0;
  else if (typeof value === 'number') num = value;
  else {
    // strip anything that isn't digit, dot, or minus sign, then parse
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    num = Number(cleaned || 0);
  }

  // If the incoming number looks like it's in USD (very small compared to INR), DO NOT auto-convert.
  // We assume values are already in INR. If you actually need USD->INR conversion, reintroduce a multiplier.
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatNumber = (n: number | undefined | null) => new Intl.NumberFormat('en-IN').format(n || 0);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-md border border-white/30 p-6 transition-transform transform hover:-translate-y-1 hover:shadow-lg">
    {children}
  </div>
);

const IconCircle: React.FC<{ children: React.ReactNode; from?: string; to?: string }> = ({ children, from = 'from-blue-500', to = 'to-blue-600' }) => (
  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${from} ${to} flex items-center justify-center shadow-md`}>
    <div className="text-white">{children}</div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconCircle><Package className="h-6 w-6" /></IconCircle>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-700 truncate">Equipment Types</dt>
              <dd className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalEquipmentTypes)}</dd>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconCircle from="from-green-400" to="to-green-600"><TrendingUp className="h-6 w-6" /></IconCircle>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-700 truncate">Total Units</dt>
              <dd className="text-2xl font-semibold text-gray-900">{formatNumber(stats.totalUnits)}</dd>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconCircle from="from-yellow-400" to="to-yellow-600"><svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v2" strokeWidth="1.5"/><path d="M12 21v2" strokeWidth="1.5"/></svg></IconCircle>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-700 truncate">Total Value</dt>
              <dd className="text-2xl font-semibold text-gray-900">{formatCurrencyINR((stats.totalCost as any) ?? 0)}</dd>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <IconCircle from="from-green-400" to="to-green-600"><CheckCircle className="h-6 w-6" /></IconCircle>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-700 truncate">Available</dt>
              <dd className="text-2xl font-semibold text-gray-900">{formatNumber(stats.statusTotals.available)}</dd>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Overview + Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Available</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(stats.statusTotals.available)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">In Use</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(stats.statusTotals.in_use)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{formatNumber(stats.statusTotals.maintenance)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Overview</h3>
          <div className="space-y-3">
            {Object.entries(stats.categoryTotals)
              .sort((a, b) => (b[1].cost || 0) - (a[1].cost || 0))
              .slice(0, 5)
              .map(([category, totals]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-xs text-gray-500 ml-1">({totals.count} types, {totals.units} units)</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrencyINR(totals.cost ?? 0)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
