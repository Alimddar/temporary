import { User, Balance, PaymentAccount, Transaction } from '../models/index.js';
import { Op } from 'sequelize';
import PaymentService from '../services/PaymentService.js';

// --- User Management ---

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Exclude password from results
    });
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Admin - Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // Exclude password
      include: {
        model: Balance,
        as: 'balance',
        attributes: ['amount', 'currency']
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Admin - Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, isActive } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent an admin from deactivating/changing their own role via this endpoint
    if (user.id === req.user.id && (isActive === false || role !== req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot modify their own status or role via this endpoint.'
      });
    }

    // Check for duplicate username/email if they are being changed
    if (username && username !== user.username) {
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername && existingUsername.id !== user.id) {
            return res.status(400).json({ success: false, message: 'Username already taken' });
        }
    }
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail && existingEmail.id !== user.id) {
            return res.status(400).json({ success: false, message: 'Email already taken' });
        }
    }

    await user.update({
      username: username || user.username,
      email: email || user.email,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    // Fetch the updated user (without password)
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Admin - Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent an admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        return res.status(403).json({ success: false, message: 'Admin cannot delete their own account.' });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy(); // This will also cascade delete the Balance due to onDelete: 'CASCADE'

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Admin - Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// --- Balance Management ---

const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from URL params

    const balance = await Balance.findOne({
      where: { userId: userId },
      include: {
        model: User,
        as: 'user',
        attributes: ['username', 'email'] // Only include necessary user info
      }
    });

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Balance not found for this user'
      });
    }

    res.json({
      success: true,
      data: {
        amount: balance.amount, //
        currency: balance.currency, //
        formatted: balance.getFormattedBalance(), //
        lastUpdated: balance.lastUpdated, //
        user: balance.user
      }
    });
  } catch (error) {
    console.error('Admin - Get user balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, currency } = req.body;

    const balance = await Balance.findOne({ where: { userId: userId } });

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Balance not found for this user'
      });
    }

    // Simple validation (you might want to add Joi validation here as well)
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }
    if (currency && typeof currency !== 'string' || (currency && currency.length !== 3)) {
      return res.status(400).json({ success: false, message: 'Invalid currency code (e.g., AZN).' });
    }

    await balance.update({
      amount: amount !== undefined ? amount : balance.amount, //
      currency: currency || balance.currency //
    });

    res.json({
      success: true,
      message: 'User balance updated successfully',
      data: {
        amount: balance.amount, //
        currency: balance.currency, //
        formatted: balance.getFormattedBalance(), //
        lastUpdated: balance.lastUpdated //
      }
    });
  } catch (error) {
    console.error('Admin - Update balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



// --- Payment Management ---

const getAllPaymentAccounts = async (req, res) => {
  try {
    const accounts = await PaymentAccount.findAll({
      order: [['priority', 'ASC']]
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Admin - Get payment accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPaymentAccountById = async (req, res) => {
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
    console.error('Admin - Get payment account by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updatePaymentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountIdentifier, accountDetails, isActive, priority } = req.body;

    const account = await PaymentAccount.findByPk(id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Payment account not found'
      });
    }

    await account.update({
      accountIdentifier: accountIdentifier !== undefined ? accountIdentifier : account.accountIdentifier,
      accountDetails: accountDetails || account.accountDetails,
      isActive: isActive !== undefined ? isActive : account.isActive,
      priority: priority !== undefined ? priority : account.priority
    });

    res.json({
      success: true,
      message: 'Payment account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Admin - Update payment account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPendingTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'firstName', 'lastName']
        },
        {
          model: PaymentAccount,
          as: 'paymentAccount',
          attributes: ['id', 'accountType', 'paymentType', 'accountIdentifier']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Admin - Get pending transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await PaymentService.updateTransactionStatus(transactionId, 'completed', adminNotes);

    res.json({
      success: true,
      message: 'Transaction approved and user balance updated',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        adminNotes: transaction.adminNotes
      }
    });
  } catch (error) {
    console.error('Admin - Approve transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { adminNotes } = req.body;

    const transaction = await PaymentService.updateTransactionStatus(transactionId, 'failed', adminNotes);

    res.json({
      success: true,
      message: 'Transaction rejected',
      data: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        adminNotes: transaction.adminNotes
      }
    });
  } catch (error) {
    console.error('Admin - Reject transaction error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// --- Dashboard Statistics ---

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBalance,
      transactionStats,
      paymentAccountsCount
    ] = await Promise.all([
      User.count(),
      Balance.sum('amount'),
      PaymentService.getTransactionStats(),
      PaymentAccount.count({ where: { isActive: true } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBalance: totalBalance || 0,
        transactions: transactionStats,
        paymentAccounts: paymentAccountsCount
      }
    });
  } catch (error) {
    console.error('Admin - Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBalance,
  updateBalance,
  getAllPaymentAccounts,
  getPaymentAccountById,
  updatePaymentAccount,
  getPendingTransactions,
  approveTransaction,
  rejectTransaction,
  getDashboardStats
};