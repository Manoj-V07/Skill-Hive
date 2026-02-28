const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendHrApprovalEmail } = require('../services/notificationService');


const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;


    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin registration not allowed' });
    }

    if (!['hr', 'candidate'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message:
        role === 'hr'
          ? 'HR registered successfully. Awaiting admin approval.'
          : 'Candidate registered successfully.',
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const approveHR = async (req, res) => {
  try {
    const { hrId } = req.params;

    const hr = await User.findById(hrId);
    if (!hr || hr.role !== 'hr') {
      return res.status(404).json({ message: 'HR not found' });
    }

    if (hr.isApproved) {
      return res.status(200).json({
        message: 'HR already approved',
        notification: {
          sentTo: hr.email,
          status: {
            success: false,
            skipped: true,
            reason: 'already-approved',
          },
        },
      });
    }

    hr.isApproved = true;
    await hr.save();

    const emailResult = await sendHrApprovalEmail({
      to: hr.email,
      username: hr.username,
      isApproved: true,
    });

    if (!emailResult?.success && !emailResult?.skipped) {
      console.warn(`HR approval email failed for user ${hr._id}: ${emailResult?.error || 'Unknown error'}`);
    }

    return res.status(200).json({
      message: 'HR approved successfully',
      notification: {
        sentTo: hr.email,
        status: emailResult,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const listHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: 'hr' }).select('-password');
    return res.status(200).json(hrs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const disapproveHR = async (req, res) => {
  try {
    const { hrId } = req.params;

    const hr = await User.findById(hrId);
    if (!hr || hr.role !== 'hr') {
      return res.status(404).json({ message: 'HR not found' });
    }

    if (!hr.isApproved) {
      return res.status(200).json({
        message: 'HR is already not approved',
        notification: {
          sentTo: hr.email,
          status: {
            success: false,
            skipped: true,
            reason: 'already-disapproved',
          },
        },
      });
    }

    hr.isApproved = false;
    await hr.save();

    const emailResult = await sendHrApprovalEmail({
      to: hr.email,
      username: hr.username,
      isApproved: false,
    });

    if (!emailResult?.success && !emailResult?.skipped) {
      console.warn(`HR disapproval email failed for user ${hr._id}: ${emailResult?.error || 'Unknown error'}`);
    }

    return res.status(200).json({
      message: 'HR disapproved successfully',
      notification: {
        sentTo: hr.email,
        status: emailResult,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, approveHR, listHRs , disapproveHR };
