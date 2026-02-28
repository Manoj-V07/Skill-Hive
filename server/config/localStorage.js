const path = require('path');
const fs = require('fs');

// Define uploads directory
const uploadsDir = path.join(__dirname, '../uploads/resumes');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

module.exports = {
  uploadsDir,
  resumesDir: uploadsDir,
};
