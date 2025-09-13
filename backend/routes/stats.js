import express from 'express';
import Equipment from '../models/Equipment.js';

const router = express.Router();

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const equipment = await Equipment.find({});
    
    // Calculate totals
    const totalEquipmentTypes = equipment.length;
    const totalUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = equipment.reduce((sum, item) => sum + item.totalCost, 0);
    
    // Totals by category
    const categoryTotals = equipment.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, units: 0, cost: 0 };
      }
      acc[item.category].count += 1;
      acc[item.category].units += item.quantity;
      acc[item.category].cost += item.totalCost;
      return acc;
    }, {});
    
    // Totals by status
    const statusTotals = equipment.reduce((acc, item) => {
      acc.available += item.statusCounts.available;
      acc.in_use += item.statusCounts.in_use;
      acc.maintenance += item.statusCounts.maintenance;
      return acc;
    }, { available: 0, in_use: 0, maintenance: 0 });
    
    res.json({
      totalEquipmentTypes,
      totalUnits,
      totalCost,
      categoryTotals,
      statusTotals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get detailed stats for specific category
router.get('/category/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    const equipment = await Equipment.find({ category: categoryName });
    
    if (equipment.length === 0) {
      return res.status(404).json({ message: 'Category not found or has no equipment' });
    }
    
    const totalItems = equipment.length;
    const totalUnits = equipment.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = equipment.reduce((sum, item) => sum + item.totalCost, 0);
    
    const statusTotals = equipment.reduce((acc, item) => {
      acc.available += item.statusCounts.available;
      acc.in_use += item.statusCounts.in_use;
      acc.maintenance += item.statusCounts.maintenance;
      return acc;
    }, { available: 0, in_use: 0, maintenance: 0 });
    
    // Most expensive items
    const mostExpensive = equipment
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        sku: item.sku,
        totalCost: item.totalCost,
        quantity: item.quantity
      }));
    
    // Items needing attention (low availability)
    const lowAvailability = equipment
      .filter(item => {
        const availablePercentage = (item.statusCounts.available / item.quantity) * 100;
        return availablePercentage < 20 && item.quantity > 0;
      })
      .sort((a, b) => {
        const aPercentage = (a.statusCounts.available / a.quantity) * 100;
        const bPercentage = (b.statusCounts.available / b.quantity) * 100;
        return aPercentage - bPercentage;
      })
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        sku: item.sku,
        available: item.statusCounts.available,
        total: item.quantity,
        percentage: Math.round((item.statusCounts.available / item.quantity) * 100)
      }));
    
    res.json({
      category: categoryName,
      totalItems,
      totalUnits,
      totalCost,
      statusTotals,
      mostExpensive,
      lowAvailability,
      equipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;