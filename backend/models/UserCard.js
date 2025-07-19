import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserCard = sequelize.define('UserCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cardNumber: {
    type: DataTypes.STRING(19), // Encrypted card number
    allowNull: false
  },
  cardHolder: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  expiryMonth: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  expiryYear: {
    type: DataTypes.STRING(4),
    allowNull: false
  },
  cvv: {
    type: DataTypes.STRING(4), // Encrypted CVV
    allowNull: false
  },
  cardType: {
    type: DataTypes.STRING(20), // visa, mastercard, etc.
    allowNull: true
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastFourDigits: {
    type: DataTypes.STRING(4), // For display purposes
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_cards',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'isDefault']
    }
  ]
});

// Define associations
UserCard.associate = (models) => {
  UserCard.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

export default UserCard;