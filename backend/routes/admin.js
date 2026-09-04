const express = require('express');
const mongoose = require('mongoose');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Facility = require('../models/Facility');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Article = require('../models/Article');
const DonationCenter = require('../models/DonationCenter');
const User = require('../models/User');

const router = express.Router();
router.use(requireAuth, requireAdmin);

function resourceRoutes(path, Model) {
  router.get(path, async (req, res, next) => { try { return res.json({ data: await Model.find().sort({ createdAt: -1 }).limit(200) }); } catch (error) { return next(error); } });
  router.post(path, async (req, res, next) => { try { return res.status(201).json({ data: await Model.create(req.body) }); } catch (error) { return next(error); } });
  router.patch(`${path}/:id`, async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' }); const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!item) return res.status(404).json({ message: 'Resource not found' }); return res.json({ data: item }); } catch (error) { return next(error); } });
  router.delete(`${path}/:id`, async (req, res, next) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' }); const item = await Model.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Resource not found' }); return res.status(204).send(); } catch (error) { return next(error); } });
}

resourceRoutes('/facilities', Facility);
resourceRoutes('/doctors', Doctor);
resourceRoutes('/articles', Article);
resourceRoutes('/donation-centers', DonationCenter);
router.get('/appointments', async (req, res, next) => { try { return res.json({ data: await Appointment.find().populate('user', 'name email').populate('doctor', 'name specialty').populate('facility', 'name city state').sort({ createdAt: -1 }) }); } catch (error) { return next(error); } });
router.patch('/appointments/:id', async (req, res, next) => { try { const allowed = ['pending', 'confirmed', 'cancelled', 'completed']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid appointment status' }); const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); if (!appointment) return res.status(404).json({ message: 'Appointment not found' }); return res.json({ data: appointment }); } catch (error) { return next(error); } });
router.get('/users', async (req, res, next) => { try { return res.json({ data: await User.find().select('name email phone role createdAt').sort({ createdAt: -1 }) }); } catch (error) { return next(error); } });

module.exports = router;
