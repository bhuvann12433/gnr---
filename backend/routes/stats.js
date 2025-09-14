// backend/routes/stats.js
import express from 'express';
import Equipment from '../models/Equipment.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Get summary statistics
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const equipment = await Equipment.find({});

    const totalEquipmentTypes = equipment.length;
    const totalUnits = equipment.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalCost = equipment.reduce((sum, item) => sum + (item.totalCost || 0), 0);

    const categoryTotals = equipment.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, units: 0, cost: 0 };
      }
      acc[item.category].count += 1;
      acc[item.category].units += (item.quantity || 0);
      acc[item.category].cost += (item.totalCost || 0);
      return acc;
    }, {});

    const statusTotals = equipment.reduce((acc, item) => {
      acc.available += (item.statusCounts?.available || 0);
      acc.in_use += (item.statusCounts?.in_use || 0);
      acc.maintenance += (item.statusCounts?.maintenance || 0);
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
    console.error('GET /stats/summary error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get detailed stats for specific category
router.get('/category/:name', verifyToken, async (req, res) => {
  try {
    const categoryName = req.params.name;
    const equipment = await Equipment.find({ category: categoryName });

    if (equipment.length === 0) {
      return res.status(404).json({ message: 'Category not found or has no equipment' });
    }

    const totalItems = equipment.length;
    const totalUnits = equipment.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalCost = equipment.reduce((sum, item) => sum + (item.totalCost || 0), 0);

    const statusTotals = equipment.reduce((acc, item) => {
      acc.available += (item.statusCounts?.available || 0);
      acc.in_use += (item.statusCounts?.in_use || 0);
      acc.maintenance += (item.statusCounts?.maintenance || 0);
      return acc;
    }, { available: 0, in_use: 0, maintenance: 0 });

    const mostExpensive = equipment
      .slice()
      .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        sku: item.sku,
        totalCost: item.totalCost,
        quantity: item.quantity
      }));

    const lowAvailability = equipment
      .filter(item => {
        const total = item.quantity || 0;
        if (total === 0) return false;
        const availablePercentage = ((item.statusCounts?.available || 0) / total) * 100;
        return availablePercentage < 20;
      })
      .slice()
      .sort((a, b) => {
        const aPercentage = ((a.statusCounts?.available || 0) / (a.quantity || 1)) * 100;
        const bPercentage = ((b.statusCounts?.available || 0) / (b.quantity || 1)) * 100;
        return aPercentage - bPercentage;
      })
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        sku: item.sku,
        available: item.statusCounts?.available || 0,
        total: item.quantity || 0,
        percentage: Math.round(((item.statusCounts?.available || 0) / (item.quantity || 1)) * 100)
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
    console.error('GET /stats/category/:name error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
