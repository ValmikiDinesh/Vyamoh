require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const connectDB = require('../config/db');
const { Product } = require('../models');

async function run() {
  await connectDB();
  const products = await Product.find({});
  console.log(`Found ${products.length} products to check.`);
  
  for (const product of products) {
    const baseSlug = slugify(product.name, { lower: true, strict: true });
    // Check if the current slug starts with the base slug or is generally correct
    if (!product.slug || !product.slug.startsWith(baseSlug)) {
      const oldSlug = product.slug;
      const newSlug = baseSlug + '-' + Date.now().toString(36);
      product.slug = newSlug;
      await product.save();
      console.log(`Updated product: "${product.name}"\n  Old Slug: ${oldSlug}\n  New Slug: ${newSlug}`);
    } else {
      console.log(`Product "${product.name}" already has valid slug: ${product.slug}`);
    }
  }
  
  console.log('Migration complete!');
  mongoose.connection.close();
}

run();
