import { User, Balance } from '../models/index.js';

const seedAdminUser = async () => {
  try {
    // Create admin user if it doesn't exist
    const [adminUser, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      }
    });

    if (created) {
      // Create initial balance for admin user
      await Balance.create({
        userId: adminUser.id,
        amount: 1000.00,
        currency: 'AZN'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

export { seedAdminUser };