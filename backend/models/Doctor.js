const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  specialty: { type: String, required: true, trim: true, index: true },
  bio: { type: String, trim: true },
  phone: String,
  email: String,
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
  availableSlots: [{ type: Date }],
  active: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Doctor', doctorSchema);
