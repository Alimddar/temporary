import PaymentService from '../services/PaymentService.js';
import { PaymentAccount, Transaction, UserCard } from '../models/index.js';
import crypto from 'crypto';

class PaymentController {
  // Get all payment accounts (renamed from methods)
  async getPaymentMethods(req, res) {
    try {
      const accounts = await PaymentAccount.findAll({
        where: { isActive: true },
        order: [['priority', 'ASC']],
        attributes: ['id', 'paymentType', 'accountType', 'minAmount', 'maxAmount', 'commission', 'accountIdentifier']
      });

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get payment account details for a specific payment type (public)
  async getPaymentAccountDetails(req, res) {
    try {
      const { methodName } = req.params;

      // Find the payment account by payment type
      const paymentAccount = await PaymentAccount.findOne({
        where: {
          paymentType: methodName,
          isActive: true
        },
        order: [['priority', 'ASC']]
      });

      if (!paymentAccount) {
        return res.status(404).json({
          success: false,
          message: 'No active payment account found for this payment type'
        });
      }

      // Return the account details
      res.json({
        success: true,
        data: paymentAccount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create deposit (user submits payment request)
  async createDeposit(req, res) {
    try {
      const { paymentAccountId, amount } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!paymentAccountId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Payment account and amount are required'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      const result = await PaymentService.createDeposit(userId, paymentAccountId, parseFloat(amount));

      res.json({
        success: true,
        message: 'Deposit request created successfully. Please make the payment and wait for admin approval.',
        data: {
          transactionId: result.transaction.transactionId,
          amount: result.transaction.amount,
          commission: result.transaction.commission,
          totalAmount: result.transaction.totalAmount,
          paymentDetails: result.paymentDetails,
          expiresAt: result.transaction.expiresAt,
          status: result.transaction.status,
          paymentAccount: {
            type: result.paymentAccount.paymentType,
            accountType: result.paymentAccount.accountType
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's transactions
  async getUserTransactions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await PaymentService.getUserTransactions(userId, parseInt(limit), offset);

      res.json({
        success: true,
        data: {
          transactions: result.rows,
          total: result.count,
          page: parseInt(page),
          totalPages: Math.ceil(result.count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get single transaction details
  async getTransaction(req, res) {
    try {
      const { transactionId } = req.params;
      const userId = req.user.id;

      const transaction = await Transaction.findOne({
        where: { 
          transactionId,
          userId
        },
        include: [{
          model: PaymentAccount,
          as: 'paymentAccount',
          attributes: ['paymentType', 'accountType']
        }]
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get all transactions for management
  async getAllTransactions(req, res) {
    try {
      const { page = 1, limit = 50, status, paymentAccountId, dateFrom, dateTo } = req.query;
      const offset = (page - 1) * limit;

      const filters = {};
      if (status) filters.status = status;
      if (paymentAccountId) filters.paymentAccountId = paymentAccountId;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const result = await PaymentService.getAllTransactions(filters, parseInt(limit), offset);

      res.json({
        success: true,
        data: {
          transactions: result.rows,
          total: result.count,
          page: parseInt(page),
          totalPages: Math.ceil(result.count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Update transaction status
  async updateTransactionStatus(req, res) {
    try {
      const { transactionId } = req.params;
      const { status, adminNotes } = req.body;

      if (!status || !['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const transaction = await PaymentService.updateTransactionStatus(transactionId, status, adminNotes);

      res.json({
        success: true,
        message: 'Transaction status updated successfully',
        data: {
          transactionId: transaction.transactionId,
          status: transaction.status,
          adminNotes: transaction.adminNotes
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get transaction statistics
  async getTransactionStats(req, res) {
    try {
      const stats = await PaymentService.getTransactionStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Create payment account (removed createPaymentMethod since we only use accounts)

  // Admin: Get all payment accounts
  async getAllPaymentAccounts(req, res) {
    try {
      const accounts = await PaymentAccount.findAll({
        order: [['priority', 'ASC'], ['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: accounts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get single payment account by ID
  async getPaymentAccountById(req, res) {
    try {
      const { id } = req.params;
      const account = await PaymentAccount.findByPk(id);
      
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Payment account not found'
        });
      }

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Update payment account
  async updatePaymentAccount(req, res) {
    try {
      const { id } = req.params;
      const { paymentType, accountType, accountDetails, accountIdentifier, priority, minAmount, maxAmount, commission, isActive } = req.body;

      const paymentAccount = await PaymentAccount.findByPk(id);
      
      if (!paymentAccount) {
        return res.status(404).json({
          success: false,
          message: 'Payment account not found'
        });
      }

      // Update fields
      if (paymentType !== undefined) paymentAccount.paymentType = paymentType;
      if (accountType !== undefined) paymentAccount.accountType = accountType;
      if (accountDetails !== undefined) paymentAccount.accountDetails = accountDetails;
      if (accountIdentifier !== undefined) paymentAccount.accountIdentifier = accountIdentifier;
      if (priority !== undefined) paymentAccount.priority = priority;
      if (minAmount !== undefined) paymentAccount.minAmount = minAmount;
      if (maxAmount !== undefined) paymentAccount.maxAmount = maxAmount;
      if (commission !== undefined) paymentAccount.commission = commission;
      if (isActive !== undefined) paymentAccount.isActive = isActive;

      await paymentAccount.save();

      res.json({
        success: true,
        message: 'Payment account updated successfully',
        data: paymentAccount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Manage payment accounts
  async createPaymentAccount(req, res) {
    try {
      const { paymentType, accountType, accountDetails, priority, minAmount, maxAmount, commission } = req.body;

      const paymentAccount = await PaymentAccount.create({
        paymentType,
        accountType,
        accountDetails,
        priority,
        minAmount,
        maxAmount,
        commission
      });

      res.status(201).json({
        success: true,
        message: 'Payment account created successfully',
        data: paymentAccount
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Visa deposit with card saving
  async createVisaDeposit(req, res) {
    try {
      const { paymentAccountId, amount, cardData, saveCard } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!paymentAccountId || !amount || !cardData) {
        return res.status(400).json({
          success: false,
          message: 'Payment account, amount, and card data are required'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      // Find the visa payment account
      const paymentAccount = await PaymentAccount.findOne({
        where: { id: paymentAccountId, isActive: true }
      });

      if (!paymentAccount) {
        return res.status(404).json({
          success: false,
          message: 'Payment account not found'
        });
      }

      // Validate amount limits
      if (amount < paymentAccount.minAmount || amount > paymentAccount.maxAmount) {
        return res.status(400).json({
          success: false,
          message: `Amount must be between ${paymentAccount.minAmount} and ${paymentAccount.maxAmount} AZN`
        });
      }

      // Calculate commission
      const commission = (parseFloat(amount) * paymentAccount.commission) / 100;
      const totalAmount = parseFloat(amount) + commission;

      // Create transaction
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const transaction = await Transaction.create({
        transactionId,
        userId,
        paymentAccountId: paymentAccount.id,
        amount: parseFloat(amount),
        commission,
        totalAmount,
        status: 'pending',
        paymentDetails: {
          cardData: {
            lastFourDigits: cardData.cardNumber.slice(-4),
            cardHolder: cardData.cardHolder,
            bank: cardData.bank
          }
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });

      // Save user card if requested
      let cardSaved = false;
      if (saveCard) {
        try {
          const secretKey = process.env.ENCRYPTION_KEY || 'your-secret-key-for-encryption';
          
          // Validate card data before saving
          if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiry || !cardData.cvv) {
            console.warn('Card saving skipped: incomplete card data');
          } else {
            // Simple encryption (in production, use more robust encryption)
            const encryptedCardNumber = crypto.createHash('sha256').update(cardData.cardNumber + secretKey).digest('hex');
            const encryptedCVV = crypto.createHash('sha256').update(cardData.cvv + secretKey).digest('hex');
            
            const [month, year] = cardData.expiry.split('/');
            
            // Validate expiry date format
            if (!month || !year || month.length !== 2 || year.length !== 2) {
              console.warn('Card saving skipped: invalid expiry date format');
            } else {
              // Check if user already has this card
              const existingCard = await UserCard.findOne({
                where: {
                  userId,
                  lastFourDigits: cardData.cardNumber.slice(-4),
                  cardHolder: cardData.cardHolder
                }
              });

              if (!existingCard) {
                await UserCard.create({
                  userId,
                  cardNumber: encryptedCardNumber,
                  cardHolder: cardData.cardHolder,
                  expiryMonth: month,
                  expiryYear: `20${year}`,
                  cvv: encryptedCVV,
                  cardType: this.detectCardType(cardData.cardNumber),
                  lastFourDigits: cardData.cardNumber.slice(-4),
                  isDefault: false,
                  isActive: true
                });
                cardSaved = true;
                console.log(`Card saved successfully for user ${userId}`);
              } else {
                console.log(`Card already exists for user ${userId}`);
                cardSaved = true; // Consider existing card as "saved"
              }
            }
          }
        } catch (cardError) {
          console.error('Error saving card:', cardError);
          // Don't fail the transaction if card saving fails
        }
      }

      res.json({
        success: true,
        message: 'Visa deposit request created successfully. Admin will review your payment.',
        data: {
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          commission: transaction.commission,
          totalAmount: transaction.totalAmount,
          status: transaction.status,
          expiresAt: transaction.expiresAt,
          paymentAccount: {
            type: paymentAccount.paymentType,
            accountType: paymentAccount.accountType
          },
          cardSaved: cardSaved
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Helper method to detect card type
  detectCardType(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    
    return 'unknown';
  }

  // Upload receipt
  async uploadReceipt(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      res.json({
        success: true,
        message: 'Receipt uploaded successfully',
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          path: req.file.path
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new PaymentController();