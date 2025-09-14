// backend/routes/equipment.js
import express from 'express';
import Equipment from '../models/Equipment.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

// Get all equipment with optional filters
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let equipment = await Equipment.find(query).sort({ createdAt: -1 });

    if (status && status !== 'all') {
      equipment = equipment.filter(item => item.statusCounts[status] > 0);
    }

    res.json(equipment);
  } catch (error) {
    console.error('GET /equipment error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get single equipment item
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    console.error('GET /equipment/:id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create new equipment
router.post('/', verifyToken, async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    const savedEquipment = await equipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    console.error('POST /equipment error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update equipment
router.put('/:id', verifyToken, async (req, res) => {
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
    console.error('PUT /equipment/:id error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update equipment status
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, change } = req.body;

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (!['available', 'in_use', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status type' });
    }

    const newStatusCounts = { ...equipment.statusCounts };
    newStatusCounts[status] += change;

    if (newStatusCounts[status] < 0) {
      return res.status(400).json({ message: `Cannot set ${status} count below 0` });
    }

    equipment.statusCounts = newStatusCounts;
    const updatedEquipment = await equipment.save();

    res.json(updatedEquipment);
  } catch (error) {
    console.error('PATCH /equipment/:id/status error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete equipment
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('DELETE /equipment/:id error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
