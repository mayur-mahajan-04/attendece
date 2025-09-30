const express = require('express');
const Attendance = require('../models/Attendance');
const QRCodeModel = require('../models/QRCode');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Mark attendance via QR code
router.post('/mark', auth, authorize('student'), async (req, res) => {
  try {
    const { qrCodeId, latitude, longitude, faceVerified = false } = req.body;

    const qrCode = await QRCodeModel.findById(qrCodeId).populate('teacher');
    if (!qrCode || !qrCode.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive QR code' });
    }

    // Check if QR code has expired
    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if attendance already marked for this subject today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      student: req.user._id,
      subject: qrCode.subject,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this subject today' });
    }

    const attendance = new Attendance({
      student: req.user._id,
      teacher: qrCode.teacher._id,
      subject: qrCode.subject,
      location: { latitude, longitude },
      verificationMethod: 'qr',
      qrCodeId,
      faceVerified
    });

    const savedAttendance = await attendance.save();
    res.json({ message: 'Attendance marked successfully', attendance: savedAttendance });
  } catch (error) {
    console.error('Mark attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance history
router.get('/student', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate('teacher', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Fetch attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get class attendance (Teachers and Admins)
router.get('/class', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, date } = req.query;

    // Validate and sanitize subject input
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ message: 'Valid subject is required' });
    }

    let dateFilter = {};
    if (date) {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      dateFilter = { date: { $gte: targetDate, $lt: nextDay } };
    }

    const attendance = await Attendance.find({
      subject: subject.trim(),
      ...dateFilter,
      ...(req.user.role === 'teacher' ? { teacher: req.user._id } : {})
    })
    .populate('student', 'name studentId department semester')
    .populate('teacher', 'name')
    .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Fetch class attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance statistics (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today }
    });

    const attendanceBySubject = await Attendance.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalStudents,
      totalTeachers,
      todayAttendance,
      attendanceBySubject
    });
  } catch (error) {
    console.error('Fetch stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;