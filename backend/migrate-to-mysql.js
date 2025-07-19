import { Sequelize } from 'sequelize';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SQLite connection
const sqliteDb = new sqlite3.Database('./database.sqlite');
const sqliteGet = promisify(sqliteDb.get.bind(sqliteDb));
const sqliteAll = promisify(sqliteDb.all.bind(sqliteDb));

// MySQL connection
const mysqlSequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: console.log
  }
);

async function migrateData() {
  try {
    // Test MySQL connection
    await mysqlSequelize.authenticate();
    console.log('MySQL connection has been established successfully.');

    // Import models to create tables
    const modelsPath = './models/index.js';
    await import(modelsPath);

    // Sync database (create tables)
    await mysqlSequelize.sync({ force: true });
    console.log('MySQL tables created successfully.');

    // Get all table names from SQLite
    const tables = await sqliteAll(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );

    for (const table of tables) {
      const tableName = table.name;
      console.log(`Migrating table: ${tableName}`);

      // Get all data from SQLite table
      const data = await sqliteAll(`SELECT * FROM ${tableName}`);
      
      if (data.length > 0) {
        // Insert data into MySQL
        const model = mysqlSequelize.models[tableName] || mysqlSequelize.models[tableName.charAt(0).toUpperCase() + tableName.slice(1)];
        
        if (model) {
          await model.bulkCreate(data, { ignoreDuplicates: true });
          console.log(`Migrated ${data.length} records to ${tableName}`);
        } else {
          console.log(`Model not found for table: ${tableName}`);
        }
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    sqliteDb.close();
    await mysqlSequelize.close();
  }
}

migrateData();