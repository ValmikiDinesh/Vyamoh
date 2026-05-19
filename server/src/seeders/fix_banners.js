require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Banner } = require('../models');

async function run() {
  await connectDB();
  const banners = await Banner.find({});
  console.log(`Found ${banners.length} banners.`);
  
  for (const banner of banners) {
    let changed = false;
    if (banner.ctaLink && banner.ctaLink.includes('vyamoh-client.vercel.app')) {
      const oldLink = banner.ctaLink;
      // Convert it to relative link
      const newLink = banner.ctaLink.replace(/https?:\/\/vyamoh-client\.vercel\.app/, '');
      banner.ctaLink = newLink;
      changed = true;
      console.log(`Updated banner "${banner.title}" link:\n  Old: ${oldLink}\n  New: ${newLink}`);
    }
    if (changed) {
      await banner.save();
    } else {
      console.log(`Banner "${banner.title}" ctaLink: ${banner.ctaLink}`);
    }
  }
  
  console.log('Banner sync complete!');
  mongoose.connection.close();
}

run();
