import express from 'express';
import PaymentController from '../controllers/PaymentController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/methods', PaymentController.getPaymentMethods);
router.get('/method/:methodName/account', PaymentController.getPaymentAccountDetails);

// Protected user routes
router.use(authenticateToken);

// User deposit routes
router.post('/deposit', PaymentController.createDeposit);
router.post('/visa-deposit', PaymentController.createVisaDeposit);
router.post('/upload-receipt', upload.single('receipt'), PaymentController.uploadReceipt);
router.get('/transactions', PaymentController.getUserTransactions);
router.get('/transaction/:transactionId', PaymentController.getTransaction);

// Admin routes (you may want to add admin middleware here)
router.get('/admin/transactions', PaymentController.getAllTransactions);
router.patch('/admin/transaction/:transactionId/status', PaymentController.updateTransactionStatus);
router.get('/admin/stats', PaymentController.getTransactionStats);
// Removed createPaymentMethod since we only use PaymentAccounts
router.get('/admin/payment-accounts', PaymentController.getAllPaymentAccounts);
router.get('/admin/payment-accounts/:id', PaymentController.getPaymentAccountById);
router.put('/admin/payment-accounts/:id', PaymentController.updatePaymentAccount);
router.post('/admin/payment-account', PaymentController.createPaymentAccount);

export default router;