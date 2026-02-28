const express = require('express');
const router = express.Router();

const { applyForJob, getApplicationsForJob, getAllApplicationsForHR, getMyApplications, updateApplicationStatus } = require('../contollers/applicationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const uploadResume = require('../middleware/resumeUpload');

router.post('/apply/:jobId', authMiddleware, uploadResume.single('resume'), applyForJob);
router.get('/my',authMiddleware,getMyApplications);
router.get('/job/all', authMiddleware, getAllApplicationsForHR);
router.get('/job/:jobId', authMiddleware,getApplicationsForJob);
router.patch('/status/:applicationId',authMiddleware,updateApplicationStatus);

module.exports = router;
