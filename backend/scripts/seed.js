require('dotenv').config();
const { connectDatabase, disconnectDatabase } = require('../config/db');
const Facility = require('../models/Facility');
const Doctor = require('../models/Doctor');
const Article = require('../models/Article');
const DonationCenter = require('../models/DonationCenter');

const demoFacilities = [
  { name: 'Demo Lagos Island General Hospital', type: 'hospital', state: 'Lagos', lga: 'Lagos Island', city: 'Lagos', address: 'Demo address, Lagos Island', phone: '+234 800 000 1001', services: ['Emergency care', 'Outpatient', 'Maternity'], emergencyAvailable: true, verified: true, description: 'Fictional development record. Replace with officially verified data before production.' },
  { name: 'Demo Maitama District Hospital', type: 'hospital', state: 'FCT', lga: 'AMAC', city: 'Abuja', address: 'Demo address, Maitama', phone: '+234 800 000 1002', services: ['General medicine', 'Paediatrics', 'Diagnostics'], emergencyAvailable: true, verified: true, description: 'Fictional development record. Replace with officially verified data before production.' },
  { name: 'Demo HealthPlus Pharmacy Ikeja', type: 'pharmacy', state: 'Lagos', lga: 'Ikeja', city: 'Ikeja', address: 'Demo address, Ikeja', phone: '+234 800 000 1003', services: ['Prescription', 'Wellness', 'Home delivery'], verified: true, description: 'Fictional development record.' },
  { name: 'Demo Synlab Medical Laboratory', type: 'laboratory', state: 'Rivers', lga: 'Port Harcourt', city: 'Port Harcourt', address: 'Demo address, Port Harcourt', phone: '+234 800 000 1004', services: ['Blood tests', 'Imaging', 'Health screening'], verified: true, description: 'Fictional development record.' },
  { name: 'Demo National Blood Service Abuja', type: 'blood bank', state: 'FCT', lga: 'Gwagwalada', city: 'Abuja', address: 'Demo address, Gwagwalada', phone: '+234 800 000 1005', availableBloodTypes: ['O+', 'A+'], verified: true, description: 'Fictional development record.' },
  { name: 'Demo Evercare Clinic Ibadan', type: 'clinic', state: 'Oyo', lga: 'Ibadan North', city: 'Ibadan', address: 'Demo address, Ibadan North', phone: '+234 800 000 1006', services: ['Family medicine', 'Preventive care'], verified: true, description: 'Fictional development record.' }
];

async function run() {
  if (process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Set ALLOW_DEMO_SEED=true to load clearly labelled fictional development data');
  await connectDatabase();
  await Facility.deleteMany({ description: /Fictional development record/ });
  const facilities = await Facility.insertMany(demoFacilities);
  await Doctor.deleteMany({ bio: /Fictional development record/ });
  await Doctor.insertMany([{ name: 'Demo Dr. Amaka Okafor', specialty: 'General practice', bio: 'Fictional development record.', facility: facilities[0]._id }, { name: 'Demo Dr. Yusuf Bello', specialty: 'Paediatrics', bio: 'Fictional development record.', facility: facilities[1]._id }]);
  await Article.deleteMany({ author: 'HealthConnect Demo Team' });
  await Article.insertMany([{ title: 'Understanding malaria symptoms', category: 'Malaria', summary: 'Fictional development article for testing only.', content: 'Replace this fictional development content with reviewed public-health guidance.', author: 'HealthConnect Demo Team' }, { title: 'Preparing for a doctor visit', category: 'Wellness', summary: 'Fictional development article for testing only.', content: 'Replace this fictional development content with reviewed public-health guidance.', author: 'HealthConnect Demo Team' }]);
  await DonationCenter.deleteMany({ name: /Demo/ });
  await DonationCenter.insertMany([{ name: 'Demo Blood Centre Abuja', state: 'FCT', lga: 'Gwagwalada', city: 'Abuja', address: 'Demo address', phone: '+234 800 000 2001', availableBloodTypes: ['O+', 'A+'], verified: true }]);
  console.log('Inserted fictional development data only. Review and replace before production.');
  await disconnectDatabase();
}
run().catch(async (error) => { console.error('[Seed]', error.message); await disconnectDatabase(); process.exit(1); });
