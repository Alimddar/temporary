import Joi from 'joi';

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required()
});

const loginSchema = Joi.object({
  username: Joi.alternatives().try(
    Joi.string().alphanum().min(3).max(50), // Username format
    Joi.string().email() // Email format
  ).required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});

// Payment validation schemas
const depositSchema = Joi.object({
  paymentMethodId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().min(0.01).max(10000).required()
});

const updateTransactionStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed', 'cancelled').required(),
  adminNotes: Joi.string().allow('').optional()
});

const updatePaymentMethodSchema = Joi.object({
  name: Joi.string().optional(),
  displayName: Joi.string().optional(),
  type: Joi.string().valid('card', 'crypto', 'wallet').optional(),
  minAmount: Joi.number().positive().optional(),
  maxAmount: Joi.number().positive().optional(),
  commission: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().optional()
});

export {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  depositSchema,
  updateTransactionStatusSchema,
  updatePaymentMethodSchema
};