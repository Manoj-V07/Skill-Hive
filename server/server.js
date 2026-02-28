const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://skill-hive-xrvl.onrender.com',
  ],
  credentials: true,
}));

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
