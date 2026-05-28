require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Cart = require('../models/Cart');
const idGenerator = require('../utils/idGenerator');

/**
 * Seeds the default ADMIN account if it does not already exist.
 * Mirrors: DataInitializer.java → CommandLineRunner.run()
 *
 * Default credentials:
 *   Email    : admin@foodorder.lk  (override with ADMIN_EMAIL in .env)
 *   Password : Admin@1234          (override with ADMIN_PASSWORD in .env)
 */
const seedAdmin = async () => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@foodorder.lk';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

  const exists = await User.findOne({ email: ADMIN_EMAIL });
  if (exists) {
    console.log('Admin account already exists — skipping seed.');
    return;
  }

  // Do NOT hash the password here — User model's pre-save hook will hash it
  const admin = await User.create({
    userId: idGenerator.userId(),
    name: 'System Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    phone: '+94 77 000 0000',
    address: 'IJSE, Malabe, Sri Lanka',
    role: 'ADMIN',
  });

  // Empty cart for admin — required by the business logic (mirrors DataInitializer)
  await Cart.create({ userId: admin.userId, items: [], totalPrice: 0 });

  console.log('========================================================');
  console.log('  DEFAULT ADMIN ACCOUNT CREATED');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('  Role     : ADMIN');
  console.log('  IMPORTANT: Change this password after first login!');
  console.log('========================================================');
};

// Allow running standalone: `npm run seed`
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      await seedAdmin();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

module.exports = seedAdmin;
