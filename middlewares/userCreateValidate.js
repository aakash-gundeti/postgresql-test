
import { body, validationResult } from 'express-validator';

export const userCreateValidate = async (req, res, next) => {
  const rules = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Email is not valid.'),
    body('password').notEmpty().withMessage('Password is required.')
  ]

  await Promise.all(rules.map(r => r.run(req)));

  let validationErrors = validationResult(req);
  console.log(validationErrors);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }
  next();
}