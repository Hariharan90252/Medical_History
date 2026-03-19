const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Doctor = require('./DB/Doctor');
const Patient = require('./DB/Patient');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB locally
mongoose.connect('mongodb://127.0.0.1:27017/medical_history')
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory (for style.css)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'src' directory (for logo.png)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve p1.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'p1.html'));
});

// Serve signin.html when visiting the /signin URL
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Serve login.html when visiting the /login URL
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle form submissions from the login/registration page
app.post('/signin', async (req, res) => {
  const userData = req.body; // Contains all the fields from the form
  console.log('Received form data:', userData);
  
  try {
    if (userData.role === 'doctor') {
      const newDoctor = new Doctor(userData);
      await newDoctor.save(); // Save to MongoDB
      res.redirect('/dashboard.html');
    } else {
      const newPatient = new Patient(userData);
      await newPatient.save(); // Save to MongoDB
      res.redirect('/dashboard.html');
    }
  } catch (error) {
    console.error('Error saving user:', error);
    res.send(`<h1>Registration Error</h1><p>There was a problem registering your account. The email might already be in use.</p><a href="/">Go Back</a>`);
  }
});

// Handle form submissions from the login page specifically
app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Login attempt for:', email, 'as', role);
  
  try {
    // Find the user in the database based on their role
    const user = role === 'doctor' 
      ? await Doctor.findOne({ email, password })
      : await Patient.findOne({ email, password });

    if (user) {
      res.redirect('/dashboard.html');
    } else {
      res.send(`<h1>Login Failed</h1><p>Invalid email or password.</p><a href="/${role === 'doctor' ? 'Doctor' : 'Patient'}/login.html">Try Again</a>`);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.send(`<h1>Error</h1><p>An error occurred during login.</p><a href="/">Go Back</a>`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});