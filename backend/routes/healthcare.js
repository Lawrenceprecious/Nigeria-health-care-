const express = require('express');
const mongoose = require('mongoose');
const Facility = require('../models/Facility');
const Doctor = require('../models/Doctor');
const Article = require('../models/Article');
const DonationCenter = require('../models/DonationCenter');
const Appointment = require('../models/Appointment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const types = ['hospital', 'clinic', 'pharmacy', 'laboratory', 'blood bank'];

router.get('/facilities', async (req, res, next) => {
  try {
    const { search, type, state, lga, city, lat, lng, radiusKm } = req.query;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
    const filter = { verified: true };
    if (type) { if (!types.includes(type)) return res.status(400).json({ message: 'Invalid facility type' }); filter.type = type; }
    if (state) filter.state = new RegExp(`^${escapeRegex(state)}$`, 'i');
    if (lga) filter.lga = new RegExp(escapeRegex(lga), 'i');
    if (city) filter.city = new RegExp(escapeRegex(city), 'i');
    if (search) filter.$text = { $search: search };
    let query = Facility.find(filter).sort({ name: 1 });
    if (search && !filter.$text) query = query.find({ $or: [{ name: new RegExp(escapeRegex(search), 'i') }, { city: new RegExp(escapeRegex(search), 'i') }, { state: new RegExp(escapeRegex(search), 'i') }] });
    const [items, total] = await Promise.all([query.skip((page - 1) * limit).limit(limit), Facility.countDocuments(filter)]);
    let results = items;
    if (lat && lng) {
      const latitude = Number(lat); const longitude = Number(lng); const maxKm = Number(radiusKm) || 25;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ message: 'lat and lng must be numbers' });
      results = items.map((item) => ({ item, distanceKm: distanceBetween(latitude, longitude, item.latitude, item.longitude) })).filter((entry) => entry.distanceKm <= maxKm).sort((a, b) => a.distanceKm - b.distanceKm).map((entry) => ({ ...entry.item.toObject(), distanceKm: Number(entry.distanceKm.toFixed(2)) }));
    }
    return res.json({ data: results, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
});

router.get('/facilities/:id', async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid facility id' }); const facility = await Facility.findOne({ _id: req.params.id, verified: true }); if (!facility) return res.status(404).json({ message: 'Facility not found' }); return res.json({ data: facility }); } catch (error) { return next(error); }
});

router.get('/doctors', async (req, res, next) => { try { const filter = { active: true }; if (req.query.specialty) filter.specialty = new RegExp(escapeRegex(req.query.specialty), 'i'); const doctors = await Doctor.find(filter).populate('facility', 'name city state').sort({ name: 1 }); return res.json({ data: doctors }); } catch (error) { return next(error); } });
router.get('/articles', async (req, res, next) => { try { const filter = {}; if (req.query.category) filter.category = new RegExp(escapeRegex(req.query.category), 'i'); if (req.query.search) filter.$text = { $search: req.query.search }; const articles = await Article.find(filter).sort({ publishedAt: -1 }).limit(50); return res.json({ data: articles }); } catch (error) { return next(error); } });
router.get('/articles/:id', async (req, res, next) => { try { const article = await Article.findById(req.params.id); if (!article) return res.status(404).json({ message: 'Article not found' }); return res.json({ data: article }); } catch (error) { return next(error); } });
router.get('/donation-centers', async (req, res, next) => { try { const filter = { verified: true }; for (const key of ['state', 'lga', 'city']) if (req.query[key]) filter[key] = new RegExp(escapeRegex(req.query[key]), 'i'); if (req.query.bloodType) filter.availableBloodTypes = req.query.bloodType; const centers = await DonationCenter.find(filter).sort({ name: 1 }); return res.json({ data: centers }); } catch (error) { return next(error); } });
router.get('/emergency', (req, res) => res.json({ data: [{ name: 'National Emergency', number: '112', state: 'Nigeria', available: '24/7' }, { name: 'Lagos emergency response', number: '767', state: 'Lagos', available: '24/7' }] }));

router.post('/appointments', requireAuth, async (req, res, next) => { try { const { doctor, facility, requestedFor, reason } = req.body || {}; if (!mongoose.isValidObjectId(doctor) || !mongoose.isValidObjectId(facility) || !requestedFor || !reason?.trim()) return res.status(400).json({ message: 'doctor, facility, requestedFor, and reason are required' }); const appointment = await Appointment.create({ user: req.user._id, doctor, facility, requestedFor: new Date(requestedFor), reason: reason.trim() }); return res.status(201).json({ data: await appointment.populate([{ path: 'doctor', select: 'name specialty' }, { path: 'facility', select: 'name city state' }]) }); } catch (error) { return next(error); } });
router.get('/appointments/me', requireAuth, async (req, res, next) => { try { const appointments = await Appointment.find({ user: req.user._id }).populate('doctor', 'name specialty').populate('facility', 'name city state').sort({ requestedFor: 1 }); return res.json({ data: appointments }); } catch (error) { return next(error); } });

function escapeRegex(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function distanceBetween(lat1, lon1, lat2, lon2) { if (!Number.isFinite(lat2) || !Number.isFinite(lon2)) return Infinity; const radius = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180; const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2; return 2 * radius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); }
module.exports = router;
