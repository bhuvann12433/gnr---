import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Equipment from './models/Equipment.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gnr_surgicals';

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
  // ... keep your other equipment here ...
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
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Clearing existing equipment data...');
    await Equipment.deleteMany({});

    console.log('📥 Inserting sample equipment data...');
    const result = await Equipment.insertMany(sampleEquipment);
    console.log(`✅ Successfully inserted ${result.length} equipment items`);

    // ✅ Correct summary
    const totalUnits = result.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = result.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

    console.log('\n📊 Seeding Summary:');
    console.log(`- Equipment Types: ${result.length}`);
    console.log(`- Total Units: ${totalUnits}`);
    console.log(`- Total Value: $${totalCost.toFixed(2)}`);

    const categories = [...new Set(result.map(item => item.category))];
    console.log(`- Categories: ${categories.join(', ')}`);

    await mongoose.connection.close();
    console.log('\n✅ Database seeded successfully and connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
