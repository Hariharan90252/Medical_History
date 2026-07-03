global.crypto = require('crypto');
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
const Doctor = require('./DB/Doctor');
const Patient = require('./DB/Patient');
const MedicalRecord = require('./DB/MedicalRecord');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medical_history';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware to parse form data and cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'Public' directory (for style.css)
app.use(express.static(path.join(__dirname, 'Public')));

// Serve static files from the 'src' directory (for logo.png)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve p1.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'dashboard.html'));
});

// Serve signin.html when visiting the /signin URL
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'signin.html'));
});

// GET /login: Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'login.html'));
});

// GET /logout: Clear JWT cookie and redirect to login
app.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/login');
});

// Handle form submissions from the login/registration page
app.post('/signin', async (req, res) => {
  const userData = req.body;
  console.log('Received form data:', userData);
  
  try {
    let newUser;
    if (userData.role === 'doctor') {
      newUser = new Doctor(userData);
      await newUser.save();
    } else {
      newUser = new Patient(userData);
      await newUser.save();
    }

    // Issue JWT token as httpOnly cookie
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    console.log('User registered and token issued:', newUser.email);
    res.redirect('/dashboard.html');
  } catch (error) {
    console.error('Error saving user:', error.message);
    console.error('Full error:', error);
    res.send(`<h1>Registration Error</h1><p>There was a problem registering your account. Error: ${error.message}</p><a href="/">Go Back</a>`);
  }
});

// Handle form submissions from the login page specifically
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Login attempt for:', email, 'as', role);
  
  try {
    // Validate that email and password are strings to prevent NoSQL injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      console.error('Invalid email or password format');
      return res.redirect(`/login?role=${role}&error=1`);
    }

    // Find the user by email only
    const user = role === 'doctor' 
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });

    if (user) {
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {
        console.log('--- USER FOUND IN DB ---');
        console.log(user);

        // Issue JWT token as httpOnly cookie
        const token = jwt.sign(
          { id: user._id, email: user.email, role: role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        res.cookie('authToken', token, { httpOnly: true, secure: false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        
        console.log('Login successful, token issued:', user.email);
        res.redirect('/dashboard.html');
      } else {
        // Password doesn't match
        res.redirect(`/login?role=${role}&error=1`);
      }
    } else {
      res.redirect(`/login?role=${role}&error=1`);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.send(`<h1>Error</h1><p>An error occurred during login.</p><a href="/">Go Back</a>`);
  }
});

// Protected route: Get current user profile
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = req.user.role === 'doctor'
      ? await Doctor.findById(req.user.id).select('-password')
      : await Patient.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: { ...user._doc, role: req.user.role } });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected route: Generate OTP for current patient
app.post('/api/generate-otp', authMiddleware, async (req, res) => {
  try {
    // Verify the request is from a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can generate OTP' });
    }

    const { otp } = req.body;
    // Set OTP to expire in 15 minutes
    const otpExpires = new Date(Date.now() + 15 * 60000);
    await Patient.findByIdAndUpdate(req.user.id, { otp, otpExpires });
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving OTP:', error);
    res.status(500).json({ success: false });
  }
});

// API to verify OTP and fetch patient details
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const patient = await Patient.findOne({
      otp: otp,
      otpExpires: { $gt: new Date() } // Ensure OTP is not expired
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Invalid or expired access code.' });
    }

    // Fetch medical records for this patient
    const records = await MedicalRecord.find({ patientId: patient._id });

    res.json({ success: true, patient, records });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Protected route: Add medical record (doctors only)
app.post('/api/add-record', authMiddleware, async (req, res) => {
  console.log('--- ADD RECORD ATTEMPT ---');
  console.log('Incoming Data:', req.body);
  try {
    // Verify the request is from a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can add records' });
    }

    const { patientId, disease, prescription } = req.body;
    
    // Use authenticated doctor's ID instead of trusting the email from request body
    const newRecord = new MedicalRecord({
      patientId: patientId,
      doctorId: req.user.id,
      disease: disease,
      prescription: prescription
    });

    await newRecord.save();
    console.log('Success! Record saved:', newRecord);
    res.json({ success: true, record: newRecord });
  } catch (error) {
    console.error('Error adding record:', error);
    res.status(500).json({ success: false, message: 'Database error. Failed to save record.' });
  }
});

// Protected route: Fetch medical records for current patient
app.post('/api/my-records', authMiddleware, async (req, res) => {
  try {
    // Verify the request is from a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can view their records' });
    }

    // Use authenticated user's ID instead of trusting the email from request body
    const records = await MedicalRecord.find({ patientId: req.user.id });
    res.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});