import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle, AlertTriangle, Wrench, Plus, Minus } from 'lucide-react';
import { Equipment } from '../types/Equipment';

interface EquipmentTableProps {
  equipment: Equipment[];
  onEdit: (item: Equipment) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'available' | 'in_use' | 'maintenance', change: number) => void;
  loading: boolean;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  equipment,
  onEdit,
  onDelete,
  onUpdateStatus,
  loading
}) => {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleStatusChange = async (id: string, status: 'available' | 'in_use' | 'maintenance', change: number) => {
    setUpdatingStatus(`${id}-${status}`);
    try {
      await onUpdateStatus(id, status, change);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (statusCounts: Equipment['statusCounts']) => {
    const total = statusCounts.available + statusCounts.in_use + statusCounts.maintenance;
    const availablePercentage = total > 0 ? (statusCounts.available / total) * 100 : 0;
    
    if (availablePercentage >= 80) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Excellent</span>;
    } else if (availablePercentage >= 60) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Good</span>;
    } else if (availablePercentage >= 30) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Low</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critical</span>;
    }
  };

  const StatusCounter: React.FC<{
    item: Equipment;
    status: 'available' | 'in_use' | 'maintenance';
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ item, status, icon: Icon, color }) => {
    const count = item.statusCounts[status];
    const isUpdating = updatingStatus === `${item._id}-${status}`;

    return (
      <div className="flex items-center space-x-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium">{count}</span>
        <div className="flex space-x-1">
          <button
            onClick={() => handleStatusChange(item._id, status, 1)}
            disabled={isUpdating}
            className="p-1 rounded text-green-600 hover:bg-green-50 disabled:opacity-50"
            title={`Add one to ${status}`}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleStatusChange(item._id, status, -1)}
            disabled={isUpdating || count === 0}
            className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
            title={`Remove one from ${status}`}
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 text-center">
          <p className="text-gray-500">No equipment found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity & Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Distribution
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    {item.notes && (
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{formatNumber(item.quantity)} units</div>
                    <div className="text-gray-500">{formatCurrency(item.costPerUnit)} each</div>
                    <div className="font-semibold text-green-600">{formatCurrency(item.totalCost)} total</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(item.statusCounts)}
                    </div>
                    <div className="space-y-1">
                      <StatusCounter
                        item={item}
                        status="available"
                        icon={CheckCircle}
                        color="text-green-500"
                      />
                      <StatusCounter
                        item={item}
                        status="in_use"
                        icon={AlertTriangle}
                        color="text-orange-500"
                      />
                      <StatusCounter
                        item={item}
                        status="maintenance"
                        icon={Wrench}
                        color="text-red-500"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Edit equipment"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(item._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete equipment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentTable;