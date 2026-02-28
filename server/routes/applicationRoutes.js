const express = require('express');
const router = express.Router();

const { applyForJob, getApplicationsForJob, getAllApplicationsForHR, getMyApplications, updateApplicationStatus } = require('../contollers/applicationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/resumeUpload');

const uploadResumeHandler = (req, res, next) => {
	uploadResume.single('resume')(req, res, (err) => {
		if (!err) return next();

		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ message: 'Resume file must be 5MB or smaller' });
		}

		return res.status(400).json({ message: err.message || 'Invalid resume upload' });
	});
};

router.post('/apply/:jobId', authMiddleware, uploadResumeHandler, applyForJob);
router.get('/my',authMiddleware,getMyApplications);
router.get('/job/all', authMiddleware, getAllApplicationsForHR);
router.get('/job/:jobId', authMiddleware,getApplicationsForJob);
router.patch('/status/:applicationId',authMiddleware,updateApplicationStatus);

module.exports = router;
