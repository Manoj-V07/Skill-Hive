const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://recruitment-management-system-flame.vercel.app',
  'https://recruitment-management-system-eight.vercel.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// Serve static files for resumes
app.use('/uploads/resumes', express.static(require('path').join(__dirname, 'uploads/resumes')));

// ROUTES
app.use('/auth', require('./routes/authRoutes'));
app.use('/jobs', require('./routes/jobRoutes'));
app.use('/applications', require('./routes/applicationRoutes'));
app.use('/resume', require('./routes/resumeRoutes'));

app.get('/', (req, res) => {
  res.status(200).send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
