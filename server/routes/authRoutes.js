const express = require('express');
const router = express.Router();

const { register, login, approveHR, listHRs, disapproveHR } = require('../contollers/authController');

const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.patch('/approve-hr/:hrId', authMiddleware, adminOnly, approveHR);
router.patch('/disapprove-hr/:hrId', authMiddleware, adminOnly, disapproveHR);
router.get('/hrs', authMiddleware, adminOnly, listHRs);

module.exports = router;
