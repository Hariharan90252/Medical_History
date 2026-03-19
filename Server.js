const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory (for style.css)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'src' directory (for logo.png)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Serve p1.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'p1.html'));
});

// Serve login.html when visiting the /login URL
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});