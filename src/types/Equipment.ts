export interface Equipment {
  _id: string;
  name: string;
  category: 'Instruments' | 'Consumables' | 'Diagnostic' | 'Furniture' | 'Electronics';
  quantity: number;
  costPerUnit: number;
  statusCounts: {
    available: number;
    in_use: number;
    maintenance: number;
  };
  notes: string;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTotals {
  [category: string]: {
    count: number;
    units: number;
    cost: number;
  };
}

export interface StatusTotals {
  available: number;
  in_use: number;
  maintenance: number;
}

export interface EquipmentStats {
  totalEquipmentTypes: number;
  totalUnits: number;
  totalCost: number;
  categoryTotals: CategoryTotals;
  statusTotals: StatusTotals;
}