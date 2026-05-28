require('dotenv').config();
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/config/seeder');
const app = require('./src/app');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed default admin account (mirrors DataInitializer.java CommandLineRunner)
    await seedAdmin();

    // 3. Start Express server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check → http://localhost:${PORT}/foodorder/api/v1/health-test`);
    });
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
