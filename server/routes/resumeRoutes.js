const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Application = require('../models/Application');

/* ===============================
   AUTH (HEADER + QUERY TOKEN)
================================ */
const flexAuth = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.sendStatus(401);

    req.user = user;
    next();
  } catch {
    return res.sendStatus(401);
  }
};

/* ===============================
   VIEW RESUME (INLINE PDF)
================================ */
router.get('/view/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.sendStatus(404);

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    if (!app.resumeUrl) {
      return res.status(404).json({
        message: 'No resume found. Please reupload.',
      });
    }

    // Proxy the PDF from Cloudinary
    const cloudinaryResponse = await axios.get(app.resumeUrl, {
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');

    cloudinaryResponse.data.pipe(res);
  } catch (err) {
    console.error('View resume error:', err);
    res.sendStatus(500);
  }
});

/* ===============================
   DOWNLOAD RESUME (ATTACHMENT)
================================ */
router.get('/download/:applicationId', flexAuth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.sendStatus(404);

    if (
      req.user.role !== 'hr' &&
      app.candidateId.toString() !== req.user._id.toString()
    ) {
      return res.sendStatus(403);
    }

    if (!app.resumeUrl) {
      return res.status(404).json({
        message: 'No resume found. Please reupload.',
      });
    }

    const downloadName = app.resumeFilename || 'resume.pdf';

    // Proxy the PDF from Cloudinary as an attachment
    const cloudinaryResponse = await axios.get(app.resumeUrl, {
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);

    cloudinaryResponse.data.pipe(res);
  } catch (err) {
    console.error('Download resume error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;