const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// === CORS ===
// Mirrors: CORSConfig.java (allows localhost:3000 and localhost:5173)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, Postman) or from allowed list
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
    })
);

// == Body parser ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Health check ===
// Mirrors: HealthTestWithActions.java — GET /foodorder/api/v1/health-test (Public)
app.get('/foodorder/api/v1/health-test', (req, res) => {
    res.status(200).json('Food Order System is running - V 1.0.0');
});

// === API Routes ===
// Context path /foodorder mirrors Spring Boot server.servlet.context-path=/foodorder
const API = '/foodorder/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/foods`, foodRoutes);
app.use(`${API}/cart`, cartRoutes);
app.use(`${API}/orders`, orderRoutes);
app.use(`${API}/payments`, paymentRoutes);

// === 404 for unknown routes ===
app.use((req, res) => {
    res.status(404).json({ status: 404, message: `Route not found: ${req.originalUrl}` });
});

// === Global error handler (must be last) ===
app.use(errorHandler);

module.exports = app;
