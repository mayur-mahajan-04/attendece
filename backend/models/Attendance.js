const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  verificationMethod: { type: String, enum: ['qr', 'face', 'manual'], required: true },
  qrCodeId: { type: String },
  faceVerified: { type: Boolean, default: false }
});

attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);