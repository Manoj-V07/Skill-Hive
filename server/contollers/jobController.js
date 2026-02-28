const Job = require('../models/Job');
const Application = require('../models/Application');
const { sendJobClosedEmail } = require('../services/notificationService');

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


const createJob = async (req, res) => {
  try {
    const { jobTitle, jobDescription, requiredSkills, experience, location, jobType, vacancies } = req.body;

    if (!jobTitle || !jobDescription || !requiredSkills || experience === undefined || experience === null || !location || !jobType || !vacancies) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (vacancies < 1) {
      return res.status(400).json({ message: 'Vacancies must be at least 1' });
    }

    let skillsArray;
    if (typeof requiredSkills === 'string') {
      skillsArray = requiredSkills.split(',').map(s => s.trim()).filter(s => s);
    } else if (Array.isArray(requiredSkills)) {
      skillsArray = requiredSkills;
    } else {
      return res.status(400).json({ message: 'Invalid requiredSkills format' });
    }

    if (skillsArray.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required' });
    }

    const job = await Job.create({ 
      jobTitle, 
      jobDescription, 
      requiredSkills: skillsArray, 
      experience, 
      location, 
      jobType, 
      vacancies,
      createdBy: req.user._id
    });
    
    return res.status(201).json({ message: 'Job created successfully', jobId: job._id });

  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ message : `Job created by ${req.user.username}` , jobs});

  } catch (error) {
    console.error('Error fetching HR jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('createdBy', 'username email').sort({ createdAt: -1 });

    return res.status(200).json({ message : 'All job listings' , jobs});

  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getOpenJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true }).populate('createdBy', 'username').sort({ createdAt: -1 });

    return res.status(200).json(jobs);

  } catch (error) {
    console.error('Error fetching open jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role === 'hr' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!job.isOpen) {
      return res.status(200).json({ message: 'Job already closed' });
    }

    job.isOpen = false;
    await job.save();

    await notifyJobClosureToCandidates({
      jobId: job._id,
      jobTitle: job.jobTitle,
      reason: 'manual-close',
    });

    return res.status(200).json({ message: 'Job closed successfully' });

  } catch (error) {
    console.error('Error closing job:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createJob, getMyJobs, getAllJobs, getOpenJobs, closeJob };
