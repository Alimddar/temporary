import { PaymentAccount } from '../models/index.js';

// PaymentMethods are no longer used - we use PaymentAccounts directly
const seedPaymentMethods = async () => {
  console.log('Payment methods seeding skipped (using PaymentAccounts only)');
};

const seedPaymentAccounts = async () => {
  // Payment accounts are manually managed via database
  // Check if we have any accounts
  const count = await PaymentAccount.count();
  console.log(`Payment accounts seeding completed. Found ${count} existing accounts.`);
};

const seedPaymentSystem = async () => {
  try {
    await seedPaymentMethods();
    await seedPaymentAccounts();
    console.log('Payment system seeded successfully');
  } catch (error) {
    console.error('Error seeding payment system:', error);
  }
};

export { seedPaymentSystem };