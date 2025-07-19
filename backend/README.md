# Payment System - Backend API

## Overview

This is a **manual payment processing system** built with Node.js, Express, and SQLite. The system allows users to deposit money through various payment methods, but all transactions require **manual admin approval** before user balances are updated.

## 🔐 Admin Account

- **Username**: `alimddar`
- **Password**: `hacker678876`
- **Email**: `alimddar@admin.com`
- **Role**: `admin`

## 💰 How Money Transfer Works

### 1. User Initiates Deposit

1. User logs in to their account
2. User selects a payment method (Card to Card, USDT, etc.)
3. User enters the amount they want to deposit
4. System validates the amount against min/max limits
5. System creates a **pending transaction** and shows payment details

### 2. Payment Details Provided

The system shows the user:
- **Card payments**: Card number, cardholder name, bank
- **Crypto payments**: Wallet address, network (TRC20)
- **Wallet payments**: Account number, account name
- **Transaction ID**: Unique identifier for tracking
- **Total amount**: Original amount + commission (if any)

### 3. User Makes External Payment

- User transfers money to the provided payment details **outside the system**
- User **cannot** make payment through the system itself
- User must use their bank app, crypto wallet, or other external method

### 4. Admin Reviews and Approves

1. Admin logs in to admin panel
2. Admin sees all **pending transactions**
3. Admin **manually verifies** the external payment
4. Admin either **approves** or **rejects** the transaction
5. Admin can add notes explaining the decision

### 5. Balance Update

- **If approved**: User's balance is automatically updated
- **If rejected**: Transaction is marked as failed, no balance change

## 📋 Payment Methods Available

| Method | Type | Min Amount | Max Amount | Commission |
|--------|------|------------|------------|------------|
| Card To Card Deposit | Card | 5.00 AZN | 10,000 AZN | 0% |
| Auto Mpay | Wallet | 1.00 AZN | 10,000 AZN | 0% |
| Visa/Mastercard | Card | 5.00 AZN | 10,000 AZN | 0% |
| Auto M10 | Wallet | 10.00 AZN | 10,000 AZN | 0% |
| USDT Deposit | Crypto | 1.00 AZN | 10,000 AZN | 0% |
| Tron Deposit | Crypto | 1.00 AZN | 10,000 AZN | 0% |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite3

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server will run on http://localhost:5000
```

### Database Setup

The database is automatically created with:
- Admin account (alimddar)
- All payment methods
- Sample payment accounts
- Empty transaction history

## 📡 API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

#### POST `/api/auth/login`
Login to get JWT token
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Payment System (User)

#### GET `/api/payment/methods`
Get all available payment methods (public)

#### POST `/api/payment/deposit`
Create a new deposit request (requires auth)
```json
{
  "paymentMethodId": 1,
  "amount": 100.50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit request created successfully. Please make the payment and wait for admin approval.",
  "data": {
    "transactionId": "TXN1234567890ABCDEF",
    "amount": 100.50,
    "commission": 0.00,
    "totalAmount": 100.50,
    "paymentDetails": {
      "cardNumber": "1234-5678-9101-1213",
      "cardHolder": "PAYMENT PROCESSOR",
      "bank": "Example Bank AZN"
    },
    "expiresAt": "2024-01-01T23:59:59.000Z",
    "status": "pending"
  }
}
```

#### GET `/api/payment/transactions`
Get user's transaction history (requires auth)

#### GET `/api/payment/transaction/:transactionId`
Get specific transaction details (requires auth)

### Admin Panel

#### GET `/api/admin/transactions/pending`
Get all pending transactions (admin only)

#### POST `/api/admin/transactions/:transactionId/approve`
Approve a transaction (admin only)
```json
{
  "adminNotes": "Payment verified in bank statement"
}
```

#### POST `/api/admin/transactions/:transactionId/reject`
Reject a transaction (admin only)
```json
{
  "adminNotes": "Payment not found in bank records"
}
```

#### GET `/api/admin/payment-methods`
Get all payment methods for management (admin only)

#### PUT `/api/admin/payment-methods/:id`
Update payment method settings (admin only)

#### GET `/api/admin/payment-accounts`
Get all payment accounts (admin only)

#### PUT `/api/admin/payment-accounts/:id`
Update payment account details (admin only)

### User Management (Admin)

#### GET `/api/admin/users`
Get all users (admin only)

#### GET `/api/admin/users/:id`
Get specific user details (admin only)

#### PUT `/api/admin/users/:id`
Update user information (admin only)

#### DELETE `/api/admin/users/:id`
Delete a user (admin only)

#### GET `/api/admin/users/:userId/balance`
Get user's balance (admin only)

#### PUT `/api/admin/users/:userId/balance`
Update user's balance manually (admin only)

## 🔄 Transaction Statuses

- **pending**: Transaction created, waiting for admin review
- **processing**: Admin is reviewing the transaction
- **completed**: Transaction approved, balance updated
- **failed**: Transaction rejected by admin
- **cancelled**: Transaction cancelled (if needed)

## 🎯 User Flow Example

### For Regular Users:

1. **Register/Login**: Create account or login
2. **Check Balance**: See current balance (starts with random 0.15-1.00 AZN)
3. **Choose Payment Method**: Select from available options
4. **Enter Amount**: Must be within min/max limits
5. **Get Payment Details**: System shows where to send money
6. **Make Payment**: Transfer money externally
7. **Wait for Approval**: Admin reviews and approves/rejects
8. **Balance Updated**: If approved, balance increases

### For Admin:

1. **Login**: Use admin credentials
2. **View Pending**: See all pending transactions
3. **Verify Payment**: Check external payment systems
4. **Approve/Reject**: Update transaction status
5. **Add Notes**: Explain decision for records
6. **Manage System**: Update payment methods, accounts, user balances

## 🛡️ Security Features

- **JWT Authentication**: All protected routes require valid tokens
- **Password Hashing**: Passwords stored with bcrypt
- **Input Validation**: All inputs validated with Joi
- **Transaction Expiry**: Transactions expire after 24 hours
- **Manual Verification**: No automated payments, all require human approval
- **Role-based Access**: Admin vs user permissions

## 📊 Database Schema

### Users
- id, username, email, password, firstName, lastName, role, isActive, timestamps

### Balances
- id, userId, amount, currency, lastUpdated, timestamps

### PaymentMethods
- id, name, displayName, type, minAmount, maxAmount, commission, isActive, sortOrder

### PaymentAccounts
- id, paymentMethodId, accountType, accountDetails, isActive, priority

### Transactions
- id, userId, paymentMethodId, amount, commission, totalAmount, status, transactionId, paymentDetails, expiresAt, adminNotes, timestamps

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
DB_PATH=./database.sqlite
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Package.json Scripts
```json
{
  "dev": "nodemon app.js",
  "start": "node app.js"
}
```

## 🚨 Important Notes

1. **Manual System**: This is NOT an automated payment system
2. **External Payments**: Users must pay through external methods
3. **Admin Approval**: All transactions require manual admin approval
4. **No Integration**: No integration with banks or payment processors
5. **SQLite Database**: Uses local SQLite file for data storage
6. **Security**: Designed for internal use with trusted admin

## 📁 Project Structure

```
backend/
├── app.js                 # Main application file
├── config/
│   └── database.js        # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── adminController.js # Admin management
│   └── PaymentController.js # Payment system logic
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User model
│   ├── Balance.js         # Balance model
│   ├── PaymentMethod.js   # Payment method model
│   ├── PaymentAccount.js  # Payment account model
│   ├── Transaction.js     # Transaction model
│   └── index.js           # Model associations
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── adminRoutes.js     # Admin routes
│   └── payment.js         # Payment routes
├── services/
│   └── PaymentService.js  # Payment business logic
├── utils/
│   ├── jwt.js             # JWT utilities
│   └── validation.js      # Input validation schemas
└── database.sqlite        # SQLite database file
```

## 🎉 Success Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

## ❌ Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔍 Testing

You can test the API using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)
- Insomnia

Example curl command:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alimddar@admin.com","password":"hacker678876"}'
```

This payment system is designed for **manual processing** and provides complete control over all transactions through admin approval workflow.