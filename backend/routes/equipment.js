import express from 'express';
import Equipment from '../models/Equipment.js';

const router = express.Router();

// Get all equipment with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let equipment = await Equipment.find(query).sort({ createdAt: -1 });

    // Filter by status
    if (status && status !== 'all') {
      equipment = equipment.filter(item => item.statusCounts[status] > 0);
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single equipment item
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new equipment
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    const savedEquipment = await equipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update equipment
router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update equipment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, change } = req.body; // status: 'available'|'in_use'|'maintenance', change: number (can be negative)
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Validate status type
    if (!['available', 'in_use', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    // Calculate new status counts
    const newStatusCounts = { ...equipment.statusCounts };
    newStatusCounts[status] += change;

    // Validate that status counts don't go negative
    if (newStatusCounts[status] < 0) {
      return res.status(400).json({ message: `Cannot set ${status} count below 0` });
    }

    // Update equipment
    equipment.statusCounts = newStatusCounts;
    const updatedEquipment = await equipment.save();
    
    res.json(updatedEquipment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

