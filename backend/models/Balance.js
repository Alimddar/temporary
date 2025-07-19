import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Balance = sequelize.define('Balance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'AZN'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'balances',
  timestamps: true,
  hooks: {
    beforeUpdate: (balance) => {
      balance.lastUpdated = new Date();
    }
  }
});

Balance.prototype.getFormattedBalance = function() {
  return `${parseFloat(this.amount).toFixed(2)} ₼`;
};

export default Balance;