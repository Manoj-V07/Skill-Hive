const Application = require('../models/Application');
const Job = require('../models/Job');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs/promises');
const { resumesDir } = require('../config/localStorage');
const {
  sendApplicationSubmittedEmail,
  sendApplicationStatusEmail,
  sendJobClosedEmail,
} = require('../services/notificationService');

const notifyJobClosureToCandidates = async ({ jobId, jobTitle, reason }) => {
  const applications = await Application.find({ jobId }).populate(
    'candidateId',
    'username email'
  );

  const uniqueCandidates = new Map();
  for (const application of applications) {
    const candidate = application.candidateId;
    if (candidate?.email && !uniqueCandidates.has(candidate.email)) {
      uniqueCandidates.set(candidate.email, candidate.username || 'Candidate');
    }
  }

  const notifications = [];
  for (const [email, username] of uniqueCandidates.entries()) {
    notifications.push(
      sendJobClosedEmail({
        to: email,
        candidateName: username,
        jobTitle,
        reason,
      })
    );
  }

  await Promise.allSettled(notifications);
};

const applyForJob = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply' });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isOpen) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF resume required' });
    }

    const hasCloudinaryConfig =
      !!process.env.CLOUDINARY_CLOUD_NAME &&
      !!process.env.CLOUDINARY_API_KEY &&
      !!process.env.CLOUDINARY_API_SECRET;

    let resumeUrl;

    if (hasCloudinaryConfig) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'resumes',
            resource_type: 'raw',
            public_id: `resume_${req.user._id}_${Date.now()}`,
            format: 'pdf',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      resumeUrl = uploadResult.secure_url;
    } else {
      const safeOriginalName = path
        .basename(req.file.originalname)
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const storedFilename = `${req.user._id}_${Date.now()}_${safeOriginalName}`;
      const storedFilePath = path.join(resumesDir, storedFilename);

      await fs.writeFile(storedFilePath, req.file.buffer);
      resumeUrl = `local:${storedFilename}`;
    }

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      resumeUrl,
      resumeFilename: req.file.originalname,
    });

    sendApplicationSubmittedEmail({
      to: req.user.email,
      candidateName: req.user.username,
      jobTitle: job.jobTitle,
    });

    res.status(201).json({
      message: 'Applied successfully',
      applicationId: application._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyForJob };



const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ candidateId: req.user._id }).populate('jobId', 'jobTitle location jobType').sort({ createdAt: -1 });
    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get my applications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'username email')
      .populate('jobId', 'jobTitle location jobType vacancies isOpen')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get applications for job error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllApplicationsForHR = async (req, res) => {
  try {
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    // Get all jobs created by this HR
    const jobs = await Job.find({ createdBy: req.user._id });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for those jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('candidateId', 'username email')
      .populate('jobId', 'jobTitle location jobType vacancies isOpen')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);

  } catch (error) {
    console.error('Get all applications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'HR access only' });
    }

    if (!['applied', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(applicationId)
      .populate('candidateId', 'username email')
      .populate('jobId', 'jobTitle');
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId._id);

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.status = status;
    await application.save();

    sendApplicationStatusEmail({
      to: application.candidateId?.email,
      candidateName: application.candidateId?.username || 'Candidate',
      jobTitle: application.jobId?.jobTitle || 'Job',
      status,
    });

    // Auto-close job when shortlisted count reaches vacancies
    if (status === 'shortlisted') {
      const shortlistedCount = await Application.countDocuments({
        jobId: job._id,
        status: 'shortlisted'
      });

      if (shortlistedCount >= job.vacancies) {
        if (job.isOpen) {
          job.isOpen = false;
          await job.save();

          await notifyJobClosureToCandidates({
            jobId: job._id,
            jobTitle: job.jobTitle,
            reason: 'vacancies-filled',
          });
        }
      }
    }

    return res.status(200).json({
      message: 'Application status updated successfully',
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyForJob, getMyApplications, getApplicationsForJob, getAllApplicationsForHR, updateApplicationStatus };
