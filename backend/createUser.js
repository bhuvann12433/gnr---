// backend/scripts/createUser.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// inline simple user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  const DB_NAME = process.env.DB_NAME || 'gnr_surgicals';

  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not set in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(`✅ Connected to MongoDB [${DB_NAME}]`);

    const username = 'gnrr';
    const plain = '0000';
    const hash = await bcrypt.hash(plain, 10);

    // remove old user and insert new one
    await User.deleteOne({ username });
    const u = await User.create({ username, password: hash });

    console.log(`🎉 User created: ${u.username} / ${plain}`);
  } catch (err) {
    console.error('❌ Error creating user:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
