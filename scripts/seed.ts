// import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });

// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // Import seed data
// import { userSeeds, categorySeeds, productSeeds } from '../lib/seed-Data';

// async function seedDatabase() {
//   try {
//     console.log('🌱 Starting database seeding...');
    
//     // Connect to database
//     const MONGODB_URI = process.env.MONGODB_URI;
//     if (!MONGODB_URI) {
//       throw new Error('MONGODB_URI environment variable is not set');
//     }
    
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ Connected to MongoDB');
    
//     // Clear existing data
//     console.log('Clearing existing data...');
    
//     // Define models inline
//     const userSchema = new mongoose.Schema({
//       name: String,
//       email: String,
//       password: String,
//       role: String,
//       image: String,
//       isActive: Boolean,
//       lastLogin: Date,
//       failedLoginAttempts: Number,
//     }, { timestamps: true });
    
//     const categorySchema = new mongoose.Schema({
//       name: String,
//       slug: String,
//       description: String,
//       image: String,
//       parent: mongoose.Schema.Types.ObjectId,
//       productCount: Number,
//       isActive: Boolean,
//     }, { timestamps: true });
    
//     const productSchema = new mongoose.Schema({
//       name: String,
//       description: String,
//       shortDescription: String,
//       price: Number,
//       category: mongoose.Schema.Types.ObjectId,
//       sku: String,
//       inventory: Number,
//       status: String,
//       featured: Boolean,
//       tags: [String],
//       images: {
//         main: String,
//         thumbnail: String,
//         gallery: [String],
//       },
//     }, { timestamps: true });
    
//     const User = mongoose.models.User || mongoose.model('User', userSchema);
//     const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
//     const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    
//     await User.deleteMany({});
//     await Product.deleteMany({});
//     await Category.deleteMany({});
//     console.log('✅ Cleared existing data');
    
//     // Create categories
//     console.log('Creating categories...');
//     const categories = await Category.insertMany(categorySeeds);
//     console.log(`✅ Created ${categories.length} categories`);
    
//     // Create products
//     console.log('Creating products...');
//     const products = productSeeds.map(product => ({
//       ...product,
//       images: {
//         main: product.images?.main || '',
//         thumbnail: product.images?.thumbnail || '',
//         gallery: product.images?.gallery || [],
//       }
//     }));
    
//     await Product.insertMany(products);
//     console.log(`✅ Created ${products.length} products`);
    
//     // Create users with hashed passwords
//     console.log('Creating users...');
//     for (const userData of userSeeds) {
//       const plainPassword = userData.email === 'admin@example.com' ? 'admin123' : 'user123';
//       const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
//       await User.create({
//         ...userData,
//         password: hashedPassword,
//       });
//     }
//     console.log(`✅ Created ${userSeeds.length} users`);
    
//     console.log('🎉 Database seeding completed successfully!');
//     console.log('');
//     console.log('📊 Summary:');
//     console.log(`   - ${categories.length} categories`);
//     console.log(`   - ${products.length} products`);
//     console.log(`   - ${userSeeds.length} users`);
//     console.log('');
//     console.log('🔑 Login Credentials:');
//     console.log('   Admin: admin@example.com / admin123');
//     console.log('   User:  user@example.com / user123');
    
//     await mongoose.disconnect();
//     process.exit(0);
//   } catch (error: any) {
//     console.error('❌ Error seeding database:', error.message);
//     process.exit(1);
//   }
// }

// // Run the seed
// seedDatabase();


// scripts/seed.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { userSeeds, categorySeeds, productSeeds } from '@/lib/seed-Data';
import User from '@/lib/models/user-model';      // adjust path if needed
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