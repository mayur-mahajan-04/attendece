const express = require('express');
const Timetable = require('../models/Timetable');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get timetable by year and division
router.get('/', auth, async (req, res) => {
  try {
    const { year, division } = req.query;
    
    if (!year || !division) {
      return res.status(400).json({ message: 'Year and division are required' });
    }

    const timetable = await Timetable.find({ 
      year: parseInt(year), 
      division: division.toUpperCase() 
    }).sort({ day: 1, timeSlot: 1 });

    res.json(timetable);
  } catch (error) {
    console.error('Get timetable error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed timetable data (Admin only)
router.post('/seed', auth, async (req, res) => {
  try {
    await Timetable.deleteMany({});

    const timetableData = [
      // 1st Year A
      { year: 1, division: 'A', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A101' },
      { year: 1, division: 'A', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'B205' },
      { year: 1, division: 'A', day: 'Monday', timeSlot: '11:30-12:30', subject: 'Chemistry', teacher: 'Dr. Brown', room: 'C301' },
      { year: 1, division: 'A', day: 'Tuesday', timeSlot: '9:00-10:00', subject: 'English', teacher: 'Ms. Davis', room: 'A102' },
      { year: 1, division: 'A', day: 'Tuesday', timeSlot: '10:00-11:00', subject: 'Computer Science', teacher: 'Mr. Wilson', room: 'D401' },
      
      // 1st Year B
      { year: 1, division: 'B', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Physics', teacher: 'Prof. Johnson', room: 'B206' },
      { year: 1, division: 'B', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Mathematics', teacher: 'Dr. Smith', room: 'A103' },
      { year: 1, division: 'B', day: 'Monday', timeSlot: '11:30-12:30', subject: 'English', teacher: 'Ms. Davis', room: 'A104' },
      
      // 2nd Year A
      { year: 2, division: 'A', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Data Structures', teacher: 'Dr. Lee', room: 'D402' },
      { year: 2, division: 'A', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Database Systems', teacher: 'Prof. Garcia', room: 'D403' },
      { year: 2, division: 'A', day: 'Monday', timeSlot: '11:30-12:30', subject: 'Web Development', teacher: 'Mr. Taylor', room: 'D404' },
      
      // 3rd Year A
      { year: 3, division: 'A', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Software Engineering', teacher: 'Dr. Anderson', room: 'D501' },
      { year: 3, division: 'A', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Machine Learning', teacher: 'Prof. Martinez', room: 'D502' },
      { year: 3, division: 'A', day: 'Monday', timeSlot: '11:30-12:30', subject: 'Computer Networks', teacher: 'Dr. Thompson', room: 'D503' },
      
      // 4th Year A
      { year: 4, division: 'A', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Project Work', teacher: 'Dr. White', room: 'D601' },
      { year: 4, division: 'A', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Advanced Algorithms', teacher: 'Prof. Clark', room: 'D602' },
      { year: 4, division: 'A', day: 'Monday', timeSlot: '11:30-12:30', subject: 'Cyber Security', teacher: 'Dr. Lewis', room: 'D603' }
    ];

    await Timetable.insertMany(timetableData);
    res.json({ message: 'Timetable data seeded successfully' });
  } catch (error) {
    console.error('Seed timetable error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;