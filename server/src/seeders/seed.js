require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Category, Product, Coupon, Banner } = require('../models');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding Vyamoh Sunglasses Exclusive Database...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
    Banner.deleteMany()
  ]);

  // 1. Create admin user
  await User.create({
    name: 'Vyamoh Admin',
    email: 'admin@vyamoh.com',
    password: 'admin123456',
    role: 'superadmin',
    isEmailVerified: true,
    authProvider: 'local',
  });
  console.log('✅ Admin user created (admin@vyamoh.com / admin123456)');

  // 2. Create Categories matching exclusive sunglasses lists
  const men = await Category.create({ name: 'Men', slug: 'men', description: 'Premium sunglasses crafted for men.', icon: '🕶️', sortOrder: 1 });
  const women = await Category.create({ name: 'Women', slug: 'women', description: 'Elegant styles designed for women.', icon: '👠', sortOrder: 2 });
  const unisex = await Category.create({ name: 'Unisex', slug: 'unisex', description: 'Versatile frames suited for everyone.', icon: '✨', sortOrder: 3 });
  const polarized = await Category.create({ name: 'Polarized', slug: 'polarized', description: 'Enhanced clarity and anti-glare technology.', icon: '🌊', sortOrder: 4 });
  const sports = await Category.create({ name: 'Sports', slug: 'sports', description: 'High performance sports and active eyewear.', icon: '🚴', sortOrder: 5 });
  const premium = await Category.create({ name: 'Premium', slug: 'premium', description: 'Handcrafted luxury and limited editions.', icon: '💎', sortOrder: 6 });
  const newArrivals = await Category.create({ name: 'New Arrivals', slug: 'new-arrivals', description: 'Freshly dropped shades for this season.', icon: '🔥', sortOrder: 7 });

  console.log('✅ Sunglasses categories successfully created.');

  // 3. Create dynamic banners for homepage Hero Slider
  await Banner.create([
    {
      title: 'Polarized Excellence',
      subtitle: 'Engineered for absolute clarity, zero glare, and maximum UV protection.',
      desktopImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=640&q=80',
      ctaText: 'Shop Polarized',
      ctaLink: '/products?category=polarized',
      isActive: true,
      sortOrder: 0
    },
    {
      title: 'The Titanium Collection',
      subtitle: 'Ultra-lightweight titanium frames designed for pure comfort and premium style.',
      desktopImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=640&q=80',
      ctaText: 'Explore Premium',
      ctaLink: '/products?category=premium',
      isActive: true,
      sortOrder: 1
    }
  ]);
  console.log('✅ Mock banners created successfully.');

  // 4. Create premium sunglasses products
  const products = [
    {
      name: 'Vyamoh Apex Polarized Aviator',
      brand: 'Vyamoh',
      category: polarized._id,
      description: 'The Apex Polarized Aviator represents the pinnacle of optical tech. Featuring a handcrafted gold-plated titanium frame coupled with Triacetate Cellulose (TAC) Polarized lenses that eliminate 99.9% of glare. Perfect for luxury driving and coastal weekends.',
      price: 189900,
      salePrice: 149900,
      compareAtPrice: 289900,
      sku: 'VYM-APEX-AV-GLD',
      stockQuantity: 120,
      isPolarized: true,
      tags: ['polarized', 'aviator', 'premium', 'unisex', 'bestseller'],
      thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80'
      ],
      specifications: {
        frameMaterial: 'Titanium',
        lensMaterial: 'CR-39 Polarized',
        frameSize: 'Medium',
        lensColor: 'G-15 Green',
        frameColor: 'Polished Gold',
        frameShape: 'aviator',
        gender: 'unisex',
        uvProtection: 'UV400',
        weight: 24,
        lensTechnology: 'TAC Multi-layer Polarization, Scratch-resistant, Anti-Reflective hydrophobic layer'
      },
      isFeatured: true,
      isNewArrival: true,
      isBestseller: true
    },
    {
      name: 'Stealth Matte Black Wayfarer',
      brand: 'Vyamoh',
      category: men._id,
      description: 'An elegant, blacked-out wayfarer designed with high-grade Italian acetate and scratch-resistant impact lenses. Perfectly lightweight, understated luxury.',
      price: 129900,
      salePrice: 99900,
      compareAtPrice: 199900,
      sku: 'VYM-STLH-WF-BLK',
      stockQuantity: 150,
      isPolarized: false,
      tags: ['men', 'wayfarer', 'stealth', 'unisex'],
      thumbnail: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=600&q=80'
      ],
      specifications: {
        frameMaterial: 'Acetate',
        lensMaterial: 'Polycarbonate',
        frameSize: 'Medium',
        lensColor: 'Dark Grey',
        frameColor: 'Matte Black',
        frameShape: 'wayfarer',
        gender: 'men',
        uvProtection: 'UV400',
        weight: 28,
        lensTechnology: '100% UVA/UVB blockage, Dual-hardcoated scratch resistance'
      },
      isFeatured: true,
      isNewArrival: false,
      isBestseller: true
    },
    {
      name: 'Luna Rose Gold Hexagon',
      brand: 'Vyamoh',
      category: women._id,
      description: 'Artfully designed with geometric rose gold framing and gradient pink lenses. Luna offers ultra-premium aesthetics for the fashion-forward.',
      price: 219900,
      salePrice: 169900,
      compareAtPrice: 299900,
      sku: 'VYM-LUNA-HEX-PNK',
      stockQuantity: 75,
      isPolarized: false,
      tags: ['women', 'hexagon', 'rose-gold', 'premium'],
      thumbnail: 'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&w=600&q=80'
      ],
      specifications: {
        frameMaterial: 'Metal',
        lensMaterial: 'CR-39',
        frameSize: 'Small',
        lensColor: 'Gradient Pink-Gold',
        frameColor: 'Rose Gold',
        frameShape: 'cat-eye',
        gender: 'women',
        uvProtection: 'UV400',
        weight: 22,
        lensTechnology: 'Anti-Glare back coating, gradient tinting'
      },
      isFeatured: true,
      isNewArrival: true,
      isBestseller: false
    },
    {
      name: 'Vyamoh Aero Sport Polarized',
      brand: 'Vyamoh',
      category: sports._id,
      description: 'Engineered for cycling, running, and intense golf sessions. Offers non-slip rubber temples, an ultra-lightweight wrapshell frame, and polarized active lenses.',
      price: 159900,
      salePrice: 129900,
      compareAtPrice: 229900,
      sku: 'VYM-AERO-SP-BLU',
      stockQuantity: 90,
      isPolarized: true,
      tags: ['sports', 'polarized', 'active', 'unisex'],
      thumbnail: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80',
      images: [
        'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=600&q=80'
      ],
      specifications: {
        frameMaterial: 'Polycarbonate',
        lensMaterial: 'Nylon Polarized',
        frameSize: 'Large',
        lensColor: 'Blue Mirrored',
        frameColor: 'Stealth Grey',
        frameShape: 'sport',
        gender: 'unisex',
        uvProtection: 'UV400',
        weight: 20,
        lensTechnology: 'TAC Active-polarized, impact resistant shatter-safe shell'
      },
      isFeatured: false,
      isNewArrival: true,
      isBestseller: true
    }
  ];

  await Product.create(products);
  console.log(`✅ ${products.length} premium sunglasses seeded.`);

  // 5. Seeding Coupons
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, maxDiscount: 50000, minOrderAmount: 99900, description: '10% off for new customers', validFrom: new Date(), validUntil: new Date('2028-12-31'), newCustomersOnly: true, usageLimit: 1000 },
    { code: 'SHADES200', type: 'fixed', value: 20000, minOrderAmount: 149900, description: '₹200 off on premium shades', validFrom: new Date(), validUntil: new Date('2028-12-31'), usageLimit: 500 }
  ]);
  console.log('✅ Coupons seeded.');

  console.log('\n🎉 Seed complete! Enjoy your premium sunglasses store!\n');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
