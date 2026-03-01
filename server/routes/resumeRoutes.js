const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Application = require('../models/Application');
const cloudinary = require('../config/cloudinary');
const { resumesDir } = require('../config/localStorage');

const isHttpUrl = (value = '') => /^https?:\/\//i.test(value);

/* -------------------------------------------------------
   Extract the Cloudinary public_id from a secure_url.
   For raw resources the extension IS part of the public_id.
   Example URL: .../raw/upload/v123/resumes/file.pdf
   public_id  → resumes/file.pdf
------------------------------------------------------- */
const extractCloudinaryPublicId = (url) => {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;
    // Keep the full path including extension – raw public_ids include it
    return match[1];
  } catch {
    return null;
  }
};

const isCloudinaryUrl = (url = '') =>
  /res\.cloudinary\.com/i.test(url);

/**
 * Build a time-limited download URL via the Cloudinary API
 * (bypasses "Strict Transformations" / ACL restrictions).
 */
const getCloudinaryDownloadUrl = (publicId) => {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    type: 'upload',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  });
};

const resolveLocalResumePath = (resumeUrl = '') => {
  if (!resumeUrl || isHttpUrl(resumeUrl)) return null;

  if (resumeUrl.startsWith('local:')) {
    return path.join(resumesDir, path.basename(resumeUrl.slice('local:'.length)));
  }

  if (path.isAbsolute(resumeUrl)) {
    return resumeUrl;
  }

  return path.join(resumesDir, path.basename(resumeUrl));
};

const streamResume = async ({ resumeUrl, res, asAttachment = false, filename = 'resume.pdf' }) => {
  if (isHttpUrl(resumeUrl)) {
    let fetchUrl = resumeUrl;

    // If it's a Cloudinary URL, generate a download URL via the API
    // to bypass Strict Transformations / ACL restrictions
    if (isCloudinaryUrl(resumeUrl)) {
      const publicId = extractCloudinaryPublicId(resumeUrl);
      if (publicId) {
        fetchUrl = getCloudinaryDownloadUrl(publicId);
      }
    }

    const remote = await axios.get(fetchUrl, { responseType: 'stream' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      asAttachment ? `attachment; filename="${filename}"` : 'inline'
    );
    if (!asAttachment) {
      res.setHeader('Cache-Control', 'no-store');
    }
    remote.data.pipe(res);
    return;
  }

  const localPath = resolveLocalResumePath(resumeUrl);
  if (!localPath || !fs.existsSync(localPath)) {
    const error = new Error('Resume file not found in server storage');
    error.statusCode = 404;
    throw error;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    asAttachment ? `attachment; filename="${filename}"` : 'inline'
  );
  if (!asAttachment) {
    res.setHeader('Cache-Control', 'no-store');
  }

  fs.createReadStream(localPath).pipe(res);
};

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

    await streamResume({
      resumeUrl: app.resumeUrl,
      res,
      asAttachment: false,
      filename: app.resumeFilename || 'resume.pdf',
    });
  } catch (err) {
    console.error('View resume error:', err);
    if (err?.statusCode === 404) {
      return res.status(404).json({
        message:
          'Resume file is no longer available on the server. In cloud deployments this can happen after restart when local storage is used. Please re-upload the resume.',
      });
    }
    res.status(500).json({ message: 'Failed to load resume' });
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

    await streamResume({
      resumeUrl: app.resumeUrl,
      res,
      asAttachment: true,
      filename: app.resumeFilename || 'resume.pdf',
    });
  } catch (err) {
    console.error('Download resume error:', err);
    if (err?.statusCode === 404) {
      return res.status(404).json({
        message:
          'Resume file is no longer available on the server. In cloud deployments this can happen after restart when local storage is used. Please re-upload the resume.',
      });
    }
    res.status(500).json({ message: 'Failed to download resume' });
  }
});

module.exports = router;