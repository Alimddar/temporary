import { PaymentAccount, Transaction, User, Balance } from '../models/index.js';
import { Op } from 'sequelize';

class PaymentService {
  // Format card number with dashes
  formatCardNumber(cardNumber) {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1-');
  }

  // Get payment account by ID
  async getPaymentAccount(paymentAccountId) {
    const account = await PaymentAccount.findOne({
      where: {
        id: paymentAccountId,
        isActive: true
      }
    });
    
    if (!account) {
      throw new Error('Payment account not available');
    }
    
    return account;
  }

  // Create deposit transaction (manual management)
  async createDeposit(userId, paymentAccountId, amount) {
    const paymentAccount = await this.getPaymentAccount(paymentAccountId);

    // Validate amount
    if (amount < paymentAccount.minAmount || amount > paymentAccount.maxAmount) {
      throw new Error(`Amount must be between ${paymentAccount.minAmount} and ${paymentAccount.maxAmount} AZN`);
    }

    // Calculate commission
    const commission = (amount * paymentAccount.commission) / 100;
    const totalAmount = amount + commission;

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare payment details based on payment type
    let paymentDetails = {};
    
    // Ensure accountDetails is parsed as object
    const accountDetails = typeof paymentAccount.accountDetails === 'string' 
      ? JSON.parse(paymentAccount.accountDetails) 
      : paymentAccount.accountDetails;
    
    switch (paymentAccount.accountType) {
      case 'card':
        paymentDetails = {
          cardNumber: this.formatCardNumber(accountDetails.cardNumber),
          cardHolder: accountDetails.cardHolder,
          bank: accountDetails.bank
        };
        break;
      
      case 'mobile':
        paymentDetails = {
          phoneNumber: accountDetails.phoneNumber,
          operator: accountDetails.operator
        };
        break;
      
      default:
        paymentDetails = accountDetails;
        break;
    }

    // Create transaction (pending manual approval)
    const transaction = await Transaction.create({
      userId,
      paymentAccountId: paymentAccount.id,
      amount,
      commission,
      totalAmount,
      transactionId,
      paymentDetails,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for manual processing
    });

    return {
      transaction,
      paymentAccount,
      paymentDetails
    };
  }

  // Admin: Update transaction status manually
  async updateTransactionStatus(transactionId, status, adminNotes = '') {
    const transaction = await Transaction.findOne({
      where: { transactionId },
      include: [
        {
          model: User,
          as: 'user',
          include: [{
            model: Balance,
            as: 'balance'
          }]
        }
      ]
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If completing a transaction, update user balance
    if (status === 'completed' && transaction.status !== 'completed') {
      const userBalance = transaction.user.balance;
      const newBalance = parseFloat(userBalance.amount) + parseFloat(transaction.amount);
      
      await userBalance.update({
        amount: newBalance,
        lastUpdated: new Date()
      });
    }

    // Update transaction
    await transaction.update({
      status,
      adminNotes
    });

    return transaction;
  }

  // Get user transactions
  async getUserTransactions(userId, limit = 10, offset = 0) {
    return await Transaction.findAndCountAll({
      where: { userId },
      include: [{
        model: PaymentAccount,
        as: 'paymentAccount',
        attributes: ['paymentType', 'accountType']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  // Admin: Get all transactions for management
  async getAllTransactions(filters = {}, limit = 50, offset = 0) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.paymentAccountId) {
      where.paymentAccountId = filters.paymentAccountId;
    }
    
    if (filters.dateFrom) {
      where.createdAt = {
        [Op.gte]: new Date(filters.dateFrom)
      };
    }
    
    if (filters.dateTo) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(filters.dateTo)
      };
    }

    return await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: PaymentAccount,
          as: 'paymentAccount',
          attributes: ['paymentType', 'accountType']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  }

  // Admin: Get transaction statistics
  async getTransactionStats() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      weeklyTransactions,
      monthlyTransactions
    ] = await Promise.all([
      Transaction.count(),
      Transaction.count({ where: { status: 'pending' } }),
      Transaction.count({ where: { status: 'completed' } }),
      Transaction.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
      Transaction.count({ where: { createdAt: { [Op.gte]: monthAgo } } })
    ]);

    return {
      total: totalTransactions,
      pending: pendingTransactions,
      completed: completedTransactions,
      weekly: weeklyTransactions,
      monthly: monthlyTransactions
    };
  }
}

export default new PaymentService();