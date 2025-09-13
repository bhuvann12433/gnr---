import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// simple user model (inline)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log('MONGODB_URI:', !!uri); // shows true if set
  if (!uri) { console.error('MONGODB_URI is not set in backend/.env'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const username = 'gnrr';
  const plain = '0000';
  const hash = await bcrypt.hash(plain, 10);

  // remove existing and create
  await User.deleteOne({ username });
  const u = await User.create({ username, password: hash });
  console.log('Created user', u.username);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error('Error creating user:', err); process.exit(1); });

