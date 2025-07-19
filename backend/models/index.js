import User from './User.js';
import Balance from './Balance.js';
import PaymentAccount from './PaymentAccount.js';
import Transaction from './Transaction.js';
import UserCard from './UserCard.js';

// Define associations
User.hasOne(Balance, {
  foreignKey: 'userId',
  as: 'balance',
  onDelete: 'CASCADE'
});

Balance.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Payment system associations - only PaymentAccounts and Transactions
PaymentAccount.hasMany(Transaction, {
  foreignKey: 'paymentAccountId',
  as: 'transactions'
});

Transaction.belongsTo(PaymentAccount, {
  foreignKey: 'paymentAccountId',
  as: 'paymentAccount'
});

User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',
  onDelete: 'CASCADE'
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User cards associations
User.hasMany(UserCard, {
  foreignKey: 'userId',
  as: 'cards',
  onDelete: 'CASCADE'
});

UserCard.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export { User, Balance, PaymentAccount, Transaction, UserCard };