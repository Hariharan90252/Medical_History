const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.post('/signin', (req, res) => {
  const userData = req.body; // Contains all the fields from the form
  console.log('Received form data:', userData);
  
  if (userData.role === 'doctor') {
    res.send(`<h1>Doctor Verification Received</h1><p>Thank you Dr. ${userData.fullName}. Your license (${userData.licenseNumber}) is pending verification.</p><a href="/">Go Back</a>`);
  } else {
    res.send(`<h1>Patient Login Successful</h1><p>Welcome back, ${userData.email}!</p><a href="/">Go Back</a>`);
  }
});

// Handle form submissions from the login page specifically
app.post('/login', (req, res) => {
  console.log('Login attempt for:', req.body.email);
  res.send(`<h1>Login Successful</h1><p>Welcome back, ${req.body.email}!</p><a href="/">Go Back</a>`);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});