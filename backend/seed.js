import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './models/Equipment.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gnr_surgicals';

const sampleEquipment = [
  {
    name: 'Surgical Scissors',
    sku: 'SS001',
    category: 'Instruments',
    quantity: 25,
    costPerUnit: 45.99,
    statusCounts: { available: 18, in_use: 5, maintenance: 2 },
    location: 'Operating Room A',
    notes: 'Curved, 6-inch stainless steel'
  },
  {
    name: 'Disposable Gloves (Box)',
    sku: 'GL100',
    category: 'Consumables',
    quantity: 150,
    costPerUnit: 12.50,
    statusCounts: { available: 120, in_use: 30, maintenance: 0 },
    location: 'Storage Room B',
    notes: 'Latex-free, size L, 100 pieces per box'
  },
  {
    name: 'Pulse Oximeter',
    sku: 'PX300',
    category: 'Diagnostic',
    quantity: 8,
    costPerUnit: 299.99,
    statusCounts: { available: 5, in_use: 2, maintenance: 1 },
    location: 'Ward 1',
    notes: 'Digital display, finger clip type'
  },
  {
    name: 'Surgical Forceps',
    sku: 'SF002',
    category: 'Instruments',
    quantity: 30,
    costPerUnit: 38.75,
    statusCounts: { available: 22, in_use: 6, maintenance: 2 },
    location: 'Operating Room B',
    notes: 'Straight, 5-inch, non-serrated'
  },
  {
    name: 'Blood Pressure Monitor',
    sku: 'BP200',
    category: 'Diagnostic',
    quantity: 12,
    costPerUnit: 185.00,
    statusCounts: { available: 8, in_use: 3, maintenance: 1 },
    location: 'Outpatient Clinic',
    notes: 'Digital, automatic inflation'
  },
  {
    name: 'Surgical Masks (Box)',
    sku: 'SM050',
    category: 'Consumables',
    quantity: 200,
    costPerUnit: 8.99,
    statusCounts: { available: 180, in_use: 20, maintenance: 0 },
    location: 'Storage Room A',
    notes: '3-ply, fluid resistant, 50 pieces per box'
  },
  {
    name: 'Patient Examination Bed',
    sku: 'EB400',
    category: 'Furniture',
    quantity: 6,
    costPerUnit: 1250.00,
    statusCounts: { available: 4, in_use: 2, maintenance: 0 },
    location: 'Examination Rooms',
    notes: 'Adjustable height, with stirrups'
  },
  {
    name: 'Thermometer (Digital)',
    sku: 'TH150',
    category: 'Diagnostic',
    quantity: 20,
    costPerUnit: 25.50,
    statusCounts: { available: 15, in_use: 4, maintenance: 1 },
    location: 'General Storage',
    notes: 'Fast reading, fever alert'
  },
  {
    name: 'IV Stand',
    sku: 'IV500',
    category: 'Furniture',
    quantity: 15,
    costPerUnit: 89.99,
    statusCounts: { available: 10, in_use: 4, maintenance: 1 },
    location: 'Patient Rooms',
    notes: '4-hook, adjustable height, wheeled base'
  },
  {
    name: 'Suture Kit',
    sku: 'SK030',
    category: 'Instruments',
    quantity: 40,
    costPerUnit: 15.75,
    statusCounts: { available: 32, in_use: 6, maintenance: 2 },
    location: 'Surgery Prep',
    notes: 'Complete kit with needle holder and scissors'
  },
  {
    name: 'ECG Machine',
    sku: 'ECG600',
    category: 'Electronics',
    quantity: 3,
    costPerUnit: 2500.00,
    statusCounts: { available: 2, in_use: 1, maintenance: 0 },
    location: 'Cardiology Department',
    notes: '12-lead, with printer and interpretation'
  },
  {
    name: 'Gauze Pads (Pack)',
    sku: 'GP080',
    category: 'Consumables',
    quantity: 100,
    costPerUnit: 6.25,
    statusCounts: { available: 85, in_use: 15, maintenance: 0 },
    location: 'Nursing Station',
    notes: '4x4 inch, sterile, 10 pieces per pack'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing equipment data...');
    await Equipment.deleteMany({});

    // Insert sample data
    console.log('Inserting sample equipment data...');
    const result = await Equipment.insertMany(sampleEquipment);
    console.log(`Successfully inserted ${result.length} equipment items`);

    // Display summary
    const totalUnits = result.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = result.reduce((sum, item) => sum + item.totalCost, 0);
    
    console.log('\nSeeding Summary:');
    console.log(`- Equipment Types: ${result.length}`);
    console.log(`- Total Units: ${totalUnits}`);
    console.log(`- Total Value: $${totalCost.toFixed(2)}`);
    
    const categories = [...new Set(result.map(item => item.category))];
    console.log(`- Categories: ${categories.join(', ')}`);

    await mongoose.connection.close();
    console.log('\nDatabase seeded successfully and connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();