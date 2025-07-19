import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PaymentAccount = sequelize.define('PaymentAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  minAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1.00
  },
  maxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 10000.00
  },
  commission: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  accountIdentifier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountDetails: {
    type: DataTypes.JSON,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'PaymentAccounts',
  timestamps: true
});

export default PaymentAccount;