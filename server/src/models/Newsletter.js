const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isSubscribed: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: { type: String, default: 'website' }, // website, checkout, popup
  },
  { timestamps: true }
);

module.exports = mongoose.model('Newsletter', newsletterSchema);
