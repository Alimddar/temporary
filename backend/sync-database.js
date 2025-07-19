import sequelize from './config/database.js';
import { User, Balance, PaymentMethod, PaymentAccount, Transaction } from './models/index.js';

async function syncDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Drop all tables first to avoid foreign key constraint issues
    await sequelize.drop();
    console.log('All tables dropped successfully.');

    // Sync models in the correct order to avoid foreign key issues
    await User.sync({ force: true });
    console.log('User table created successfully.');
    
    await Balance.sync({ force: true });
    console.log('Balance table created successfully.');
    
    await PaymentMethod.sync({ force: true });
    console.log('PaymentMethod table created successfully.');
    
    await PaymentAccount.sync({ force: true });
    console.log('PaymentAccount table created successfully.');
    
    await Transaction.sync({ force: true });
    console.log('Transaction table created successfully.');

    console.log('All models were synchronized successfully.');

    // Close connection
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

syncDatabase();