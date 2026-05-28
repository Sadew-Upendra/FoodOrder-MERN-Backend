# 🍔 FoodOrder Backend — MERN Stack

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**A full-featured RESTful food ordering backend built with the MERN stack.**  
Migrated from Spring Boot + MySQL — same API contract, zero frontend changes required.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration with BCrypt password hashing
- 👥 **Role-Based Access Control** — `ADMIN` and `CUSTOMER` roles with route-level guards
- 🗂️ **Category Management** — Full CRUD with cascading delete to food items
- 🍕 **Food Item Management** — CRUD with category filter and keyword search
- 🛒 **Shopping Cart** — Per-user persistent cart with real-time total recalculation
- 📦 **Order Management** — Place orders from cart, track status, cancel orders
- 💳 **Payment Processing** — Link payments to orders with duplicate-payment protection
- 🌱 **Auto Admin Seeding** — Default admin account created on first startup
- ⚡ **Identical API Contract** — Drop-in replacement for the Spring Boot backend

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22.x | Runtime |
| **Express.js** | 4.19 | HTTP framework |
| **MongoDB** | 8.x | NoSQL database |
| **Mongoose** | 8.3 | ODM (Object Document Mapper) |
| **JSON Web Token** | 9.x | Stateless authentication |
| **bcryptjs** | 2.4 | Password hashing |
| **express-validator** | 7.1 | Request validation |
| **uuid** | 9.x | Custom ID generation |
| **cors** | 2.8 | Cross-origin resource sharing |
| **dotenv** | 16.x | Environment variable management |
| **nodemon** | 3.1 | Hot reload for development |

---

## 📁 Project Structure

```
food-order-backend/
│
├── server.js                         # Entry point — connects DB, seeds admin, starts server
├── package.json
├── .env.example                      # Environment variable template
├── .gitignore
│
└── src/
    ├── app.js                        # Express app — routes, CORS, error handler wiring
    │
    ├── config/
    │   ├── db.js                     # MongoDB connection (Mongoose)
    │   └── seeder.js                 # Admin account auto-seeder
    │
    ├── models/                       # Mongoose schemas
    │   ├── User.js                   # userId, name, email, password, phone, address, role
    │   ├── Category.js               # categoryId, name, description, imageUrl
    │   ├── FoodItem.js               # foodItemId, name, price, status, categoryId
    │   ├── Cart.js                   # userId, items[ ], totalPrice (embedded cart items)
    │   ├── Order.js                  # orderId, userId, items[ ], status, deliveryAddress
    │   └── Payment.js                # paymentId, orderId, amount, status, transactionId
    │
    ├── middleware/
    │   ├── authMiddleware.js         # JWT token verification → req.user
    │   ├── adminMiddleware.js        # ADMIN role guard
    │   ├── validate.js               # express-validator error collector
    │   └── errorHandler.js           # Global error handler (404, 409, 401, 500...)
    │
    ├── utils/
    │   ├── idGenerator.js            # USR- / FOD- / CAT- / ORD- / PMT- prefixed UUIDs
    │   └── errorClasses.js           # Custom error classes (DataNotFoundException, etc.)
    │
    ├── controllers/                  # Business logic
    │   ├── authController.js         # login, signup
    │   ├── userController.js         # getCurrentUser, getAllUsers, getUserById, update, delete
    │   ├── categoryController.js     # CRUD + foodItemCount
    │   ├── foodController.js         # CRUD + filter by category + keyword search
    │   ├── cartController.js         # getCart, addItem, updateItem, removeItem, clearCart
    │   ├── orderController.js        # placeOrder, getMyOrders, getAllOrders, updateStatus, cancel
    │   └── paymentController.js      # processPayment, getPaymentByOrder
    │
    └── routes/                       # Express routers
        ├── authRoutes.js
        ├── userRoutes.js
        ├── categoryRoutes.js
        ├── foodRoutes.js
        ├── cartRoutes.js
        ├── orderRoutes.js
        └── paymentRoutes.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `v18+`
- [MongoDB](https://www.mongodb.com/) (local) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Clone the Repository

```bash
git clone https://github.com/Sadew-Upendra/FoodOrder-MERN-Backend.git
cd food-order-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Server
PORT=8080

# MongoDB
MONGO_URI=mongodb://localhost:27017/food_ordering_db

# JWT — generate a strong secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=86400000

# CORS — comma-separated allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Default admin account (created on first startup)
ADMIN_EMAIL=admin@foodorder.lk
ADMIN_PASSWORD=Admin@1234
```

### 4. Start the Server

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

### 5. Verify It's Running

```bash
curl http://localhost:8080/foodorder/api/v1/health-test
# → "Food Order System is running - V 1.0.0"
```

> **Default Admin Credentials**
> - Email: `admin@foodorder.lk`
> - Password: `Admin@1234`
>
> ⚠️ Change the password immediately after first login.

---

## 🔑 Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Obtain a token by calling `POST /foodorder/api/v1/auth/login` or `POST /foodorder/api/v1/auth/signup`.

---

## 📡 API Reference

**Base URL:** `http://localhost:8080/foodorder/api/v1`

### 🔐 Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/signup` | Public | Register a new customer account |
| `POST` | `/auth/login` | Public | Login and receive a JWT token |

<details>
<summary><b>POST</b> <code>/auth/signup</code></summary>

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password@123",
  "phone": "+94 77 123 4567",
  "address": "123 Main St, Colombo"
}
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "USR-xxxxxxxx-xxxx-xxxx",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```
</details>

<details>
<summary><b>POST</b> <code>/auth/login</code></summary>

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password@123"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "USR-xxxxxxxx-xxxx-xxxx",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CUSTOMER"
}
```
</details>

---

### 👤 Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users/me` | Auth | Get current logged-in user |
| `GET` | `/users` | ADMIN | Get all users |
| `GET` | `/users/:userId` | ADMIN | Get user by ID |
| `PUT` | `/users/:userId` | ADMIN | Update user |
| `DELETE` | `/users/:userId` | ADMIN | Delete user |

<details>
<summary><b>GET</b> <code>/users/me</code> — Response</summary>

```json
{
  "userId": "USR-xxxxxxxx",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94 77 123 4567",
  "address": "123 Main St",
  "role": "CUSTOMER"
}
```
</details>

---

### 🗂️ Categories

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/categories` | Public | Get all categories |
| `GET` | `/categories/:categoryId` | Public | Get category by ID |
| `POST` | `/categories` | ADMIN | Create a new category |
| `PUT` | `/categories/:categoryId` | ADMIN | Update a category |
| `DELETE` | `/categories/:categoryId` | ADMIN | Delete category (cascades to food items) |

<details>
<summary><b>POST</b> <code>/categories</code> — Request / Response</summary>

**Request Body:**
```json
{
  "name": "Burgers",
  "description": "Juicy handcrafted burgers",
  "imageUrl": "https://example.com/burgers.jpg"
}
```

**Response `201`:**
```json
{
  "categoryId": "CAT-xxxxxxxx",
  "name": "Burgers",
  "description": "Juicy handcrafted burgers",
  "imageUrl": "https://example.com/burgers.jpg",
  "foodItemCount": 0
}
```
</details>

---

### 🍕 Food Items

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/foods` | Public | Get all food items |
| `GET` | `/foods?categoryId=CAT-xxx` | Public | Filter by category |
| `GET` | `/foods?search=pizza` | Public | Search by name (case-insensitive) |
| `GET` | `/foods/:foodItemId` | Public | Get food item by ID |
| `POST` | `/foods` | ADMIN | Create a new food item |
| `PUT` | `/foods/:foodItemId` | ADMIN | Update a food item |
| `DELETE` | `/foods/:foodItemId` | ADMIN | Delete a food item |

<details>
<summary><b>POST</b> <code>/foods</code> — Request / Response</summary>

**Request Body:**
```json
{
  "name": "Classic Burger",
  "description": "Beef patty with lettuce and tomato",
  "price": 12.99,
  "imageUrl": "https://example.com/burger.jpg",
  "status": "AVAILABLE",
  "categoryId": "CAT-xxxxxxxx"
}
```

**Response `201`:**
```json
{
  "foodItemId": "FOD-xxxxxxxx",
  "name": "Classic Burger",
  "description": "Beef patty with lettuce and tomato",
  "price": 12.99,
  "imageUrl": "https://example.com/burger.jpg",
  "status": "AVAILABLE",
  "categoryId": "CAT-xxxxxxxx",
  "categoryName": "Burgers"
}
```
</details>

> **Food Item Status values:** `AVAILABLE` · `OUT_OF_STOCK`

---

### 🛒 Cart

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/cart` | Auth | Get current user's cart |
| `POST` | `/cart/add` | Auth | Add item (increments qty if already exists) |
| `PUT` | `/cart/items/:cartItemId?quantity=3` | Auth | Update item quantity (0 removes item) |
| `DELETE` | `/cart/items/:cartItemId` | Auth | Remove a single item |
| `DELETE` | `/cart/clear` | Auth | Empty the entire cart |

<details>
<summary><b>Cart Response Shape</b></summary>

```json
{
  "cartId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "userId": "USR-xxxxxxxx",
  "totalPrice": 25.98,
  "totalItems": 2,
  "items": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "foodItemId": "FOD-xxxxxxxx",
      "foodItemName": "Classic Burger",
      "foodItemImage": "https://example.com/burger.jpg",
      "quantity": 2,
      "unitPrice": 12.99,
      "subtotal": 25.98
    }
  ]
}
```
</details>

---

### 📦 Orders

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders` | Auth | Place order from current cart |
| `GET` | `/orders/my` | Auth | Get current user's orders |
| `GET` | `/orders/:orderId` | Auth | Get a single order (with payment) |
| `GET` | `/orders` | ADMIN | Get all orders |
| `PUT` | `/orders/:orderId/status?status=PREPARING` | ADMIN | Update order status |
| `PUT` | `/orders/:orderId/cancel` | Auth | Cancel own order |

<details>
<summary><b>POST</b> <code>/orders</code> — Request / Response</summary>

**Request Body:**
```json
{
  "deliveryAddress": "123 Main St, Colombo 01"
}
```

**Response `201`:**
```json
{
  "orderId": "ORD-xxxxxxxx",
  "userId": "USR-xxxxxxxx",
  "userName": "John Doe",
  "status": "PLACED",
  "orderDate": "2024-05-08T10:30:00.000Z",
  "deliveryAddress": "123 Main St, Colombo 01",
  "totalAmount": 25.98,
  "orderItems": [
    {
      "orderItemId": "64f1a2b3c4d5e6f7a8b9c0d2",
      "foodItemId": "FOD-xxxxxxxx",
      "foodItemName": "Classic Burger",
      "quantity": 2,
      "unitPrice": 12.99,
      "subtotal": 25.98
    }
  ],
  "payment": null
}
```
</details>

> **Order Status values:** `PLACED` → `PREPARING` → `ON_THE_WAY` → `DELIVERED` · `CANCELLED`

---

### 💳 Payments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/payments` | Auth | Process payment for an order |
| `GET` | `/payments/order/:orderId` | Auth | Get payment details for an order |

<details>
<summary><b>POST</b> <code>/payments</code> — Request / Response</summary>

**Request Body:**
```json
{
  "orderId": "ORD-xxxxxxxx",
  "transactionId": "TXN-123456"
}
```

**Response `200`:**
```json
{
  "paymentId": "PMT-xxxxxxxx",
  "orderId": "ORD-xxxxxxxx",
  "amount": 25.98,
  "status": "COMPLETED",
  "paymentDate": "2024-05-08T10:31:00.000Z",
  "transactionId": "TXN-123456"
}
```
</details>

> **Payment Status values:** `PENDING` · `COMPLETED` · `FAILED`

---

### ❤️ Health Check

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/health-test` | Public | Server status ping |

```bash
curl http://localhost:8080/foodorder/api/v1/health-test
# "Food Order System is running - V 1.0.0"
```

---

## 🔒 Error Response Format

All errors return a consistent JSON body:

```json
{
  "status": 404,
  "message": "Food item not found: FOD-xxxxxxxx",
  "timestamp": "2024-05-08T10:30:00.000Z"
}
```

Validation errors include a per-field map:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "email": "Valid email is required",
    "price": "Price must be a positive number"
  },
  "timestamp": "2024-05-08T10:30:00.000Z"
}
```

| HTTP Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource Not Found |
| `409` | Conflict (duplicate email / name) |
| `500` | Internal Server Error |

---

## 🌱 ID Format

All custom IDs mirror the original Spring Boot convention:

| Entity | Format | Example |
|--------|--------|---------|
| User | `USR-<uuid>` | `USR-3f2504e0-4f89-11d3-9a0c` |
| Food Item | `FOD-<uuid>` | `FOD-3f2504e0-4f89-11d3-9a0c` |
| Category | `CAT-<uuid>` | `CAT-3f2504e0-4f89-11d3-9a0c` |
| Order | `ORD-<uuid>` | `ORD-3f2504e0-4f89-11d3-9a0c` |
| Payment | `PMT-<uuid>` | `PMT-3f2504e0-4f89-11d3-9a0c` |

---

## 🔄 Migrated From Spring Boot

This project is a direct MERN conversion of the Spring Boot + MySQL backend.

| Spring Boot | MERN |
|---|---|
| `@Entity` / JPA | Mongoose `Schema` + `Model` |
| `JpaRepository` | `Model.find()`, `Model.create()` etc. |
| `@Service` | Controller functions |
| `@RestController` + `@RequestMapping` | Express Router |
| `@PreAuthorize("hasRole('ADMIN')")` | `adminOnly` middleware |
| `AuthFilter` (JWT filter chain) | `protect` middleware |
| `GlobalExceptionHandler` | `errorHandler` middleware |
| `DataInitializer` | `seeder.js` |
| `IDGenerator.java` | `idGenerator.js` (same prefixes) |
| `application-dev.properties` | `.env` file |
| MySQL | MongoDB |

> ✅ **The React frontend requires zero changes** — the API base URL, all endpoint paths, all request bodies, and all response shapes are identical.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Developed by Sadew Upendra

</div>