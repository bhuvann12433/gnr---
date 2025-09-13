import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Equipment } from '../types/Equipment';

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onSave: (equipment: Partial<Equipment>) => Promise<void>;
  onCancel: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Instruments' as Equipment['category'],
    quantity: 0,
    costPerUnit: 0,
    notes: '',
    statusCounts: {
      available: 0,
      in_use: 0,
      maintenance: 0
    }
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        category: equipment.category,
        quantity: equipment.quantity,
        costPerUnit: equipment.costPerUnit,
        notes: equipment.notes,
        statusCounts: { ...equipment.statusCounts }
      });
    }
  }, [equipment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be non-negative';
    }

    if (formData.costPerUnit < 0) {
      newErrors.costPerUnit = 'Cost per unit must be non-negative';
    }

    const totalStatus = formData.statusCounts.available + formData.statusCounts.in_use + formData.statusCounts.maintenance;
    if (totalStatus !== formData.quantity) {
      newErrors.statusCounts = `Status counts (${totalStatus}) must equal total quantity (${formData.quantity})`;
    }

    if (formData.statusCounts.available < 0 || formData.statusCounts.in_use < 0 || formData.statusCounts.maintenance < 0) {
      newErrors.statusCounts = 'Status counts cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving equipment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleStatusCountChange = (status: 'available' | 'in_use' | 'maintenance', value: number) => {
    setFormData(prev => ({
      ...prev,
      statusCounts: {
        ...prev.statusCounts,
        [status]: Math.max(0, value)
      }
    }));
    
    if (errors.statusCounts) {
      setErrors(prev => ({
        ...prev,
        statusCounts: ''
      }));
    }
  };

  const autoDistributeStatus = () => {
    setFormData(prev => ({
      ...prev,
      statusCounts: {
        available: prev.quantity,
        in_use: 0,
        maintenance: 0
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {equipment ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter equipment name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Instruments">Instruments</option>
                <option value="Consumables">Consumables</option>
                <option value="Diagnostic">Diagnostic</option>
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter quantity"
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Per Unit *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.costPerUnit ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter cost per unit"
              />
              {errors.costPerUnit && <p className="mt-1 text-sm text-red-600">{errors.costPerUnit}</p>}
            </div>
          </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Status Distribution *
              </label>
              <button
                type="button"
                onClick={autoDistributeStatus}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Auto-fill (all available)
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Available
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.statusCounts.available}
                  onChange={(e) => handleStatusCountChange('available', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  In Use
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.statusCounts.in_use}
                  onChange={(e) => handleStatusCountChange('in_use', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Maintenance
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.statusCounts.maintenance}
                  onChange={(e) => handleStatusCountChange('maintenance', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            {errors.statusCounts && <p className="mt-1 text-sm text-red-600">{errors.statusCounts}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;