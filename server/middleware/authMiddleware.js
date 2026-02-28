const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};


const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

const hrApprovedOnly = (req, res, next) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({message: 'HR access only'});
  }

  if (!req.user.isApproved) {
    return res.status(403).json({message: 'HR not approved by admin'});
  }

  next();
};


module.exports = { authMiddleware, adminOnly, hrApprovedOnly};
