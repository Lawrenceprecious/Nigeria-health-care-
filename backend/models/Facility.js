const mongoose = require('mongoose');

const openingHourSchema = new mongoose.Schema({ day: String, open: String, close: String, closed: { type: Boolean, default: false } }, { _id: false });

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  type: { type: String, enum: ['hospital', 'clinic', 'pharmacy', 'laboratory', 'blood bank'], required: true, index: true },
  state: { type: String, required: true, trim: true, index: true },
  lga: { type: String, required: true, trim: true, index: true },
  city: { type: String, required: true, trim: true, index: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },
  latitude: Number,
  longitude: Number,
  openingHours: [openingHourSchema],
  emergencyAvailable: { type: Boolean, default: false },
  services: [{ type: String, trim: true }],
  verified: { type: Boolean, default: false, index: true },
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

facilitySchema.index({ name: 'text', state: 'text', lga: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Facility', facilitySchema);
