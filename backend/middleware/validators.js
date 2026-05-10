import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      status: 400,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg }))
    });
  }
  next();
};

export const validateExpertId = [
  param('id').isMongoId().withMessage('Invalid expert ID'),
  handleValidationErrors
];

export const validateBooking = [
  body('expertId').isMongoId().withMessage('Invalid expert ID'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be a valid 10-digit number'),
  body('date').trim().notEmpty().withMessage('Date is required'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  handleValidationErrors
];

export const validateStatusUpdate = [
  param('id').isMongoId().withMessage('Invalid booking ID'),
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be pending, confirmed, completed, or cancelled'),
  handleValidationErrors
];

export const validateGetBookings = [
  query('email').isEmail().withMessage('Valid email query param is required'),
  handleValidationErrors
];

export const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['user', 'expert']).withMessage('Role must be user or expert'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];
