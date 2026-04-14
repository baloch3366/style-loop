
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { userSeeds, categorySeeds, productSeeds } from '@/lib/seed-Data';
import User from '@/lib/models/user-model';     
import Category from '@/lib/models/categories-models';
import Product from '@/lib/models/products-model';

dotenv.config({ path: '.env.local' });

async function seedDatabase() {
  // Prevent accidental seeding in production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Seeding is not allowed in production!');
    process.exit(1);
  }

  try {
    console.log('🌱 Starting database seeding...');

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create categories (preserve their fixed _id)
    console.log('Creating categories...');
    const categories = await Category.insertMany(categorySeeds);
    console.log(`✅ Created ${categories.length} categories`);

    // Create products (preserve their fixed _id and images)
    console.log('Creating products...');
    const products = await Product.insertMany(productSeeds);
    console.log(`✅ Created ${products.length} products`);

    // Create users with hashed passwords
    console.log('Creating users...');
    for (const userData of userSeeds) {
      // Use the plain password stored in the seed (or fallback)
      const plainPassword = userData.email === 'admin@example.com' ? 'admin123' : 'user123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      await User.create({
        ...userData,
        password: hashedPassword,
      });
    }
    console.log(`✅ Created ${userSeeds.length} users`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${userSeeds.length} users`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();