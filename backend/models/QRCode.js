const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  qrData: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, default: 100 } // meters
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('QRCode', qrCodeSchema);