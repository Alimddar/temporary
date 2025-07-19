import express from 'express';
const router = express.Router();
import { authenticateToken, authorize } from '../middleware/auth.js'; //
import * as adminController from '../controllers/adminController.js';

// All admin routes should require authentication and admin role
router.use(authenticateToken); //
router.use(authorize('admin')); // Only users with 'admin' role can access these routes

// User Management Routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Balance Management Routes
router.get('/users/:userId/balance', adminController.getUserBalance);
router.put('/users/:userId/balance', adminController.updateBalance);

// Payment Management Routes
router.get('/payment-accounts', adminController.getAllPaymentAccounts);
router.get('/payment-accounts/:id', adminController.getPaymentAccountById);
router.put('/payment-accounts/:id', adminController.updatePaymentAccount);

// Transaction Management Routes
router.get('/transactions/pending', adminController.getPendingTransactions);
router.post('/transactions/:transactionId/approve', adminController.approveTransaction);
router.post('/transactions/:transactionId/reject', adminController.rejectTransaction);

// Dashboard Statistics
router.get('/dashboard-stats', adminController.getDashboardStats);

export default router;