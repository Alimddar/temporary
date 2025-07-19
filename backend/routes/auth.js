import express from 'express';
import { register, login, getProfile, changePassword, getBalance } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.get('/balance', authenticateToken, getBalance);
router.put('/change-password', authenticateToken, changePassword);

export default router;