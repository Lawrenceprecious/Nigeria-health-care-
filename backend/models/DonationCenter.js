const mongoose = require('mongoose');

const donationCenterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true, index: true },
  lga: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: String,
  email: String,
  availableBloodTypes: [{ type: String, enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] }],
  donationInformation: String,
  verified: { type: Boolean, default: false, index: true },
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

donationCenterSchema.index({ name: 'text', state: 'text', lga: 'text', city: 'text' });

module.exports = mongoose.model('DonationCenter', donationCenterSchema);
