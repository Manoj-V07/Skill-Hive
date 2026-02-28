const express = require('express');
const router = express.Router();
const { createJob, getMyJobs, getAllJobs, getOpenJobs, closeJob } = require('../contollers/jobController');
const { authMiddleware, adminOnly, hrApprovedOnly } = require('../middleware/authMiddleware');


router.post( '/', authMiddleware, hrApprovedOnly, createJob);

router.get('/my', authMiddleware, getMyJobs);
router.get('/', authMiddleware, adminOnly, getAllJobs);
router.get('/open', getOpenJobs);

router.patch('/close/:jobId',authMiddleware,closeJob);

module.exports = router;
