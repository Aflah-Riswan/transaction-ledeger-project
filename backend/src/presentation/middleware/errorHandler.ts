import { Request, Response, NextFunction } from 'express';
import {
  AccountNotFoundError,
  DuplicateReferenceError,
  InsufficientBalanceError,
  ValidationError,
} from '../../domain/errors/DomainErrors';

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  // 1. Account not found -> 404
  if (error instanceof AccountNotFoundError) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 2. Insufficient balance -> 400
  if (error instanceof InsufficientBalanceError) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 3. Duplicate reference conflict -> 409
  if (error instanceof DuplicateReferenceError) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 4. Mongo duplicate key error -> 409
  if ((error as { code?: number })?.code === 11000) {
    res.status(409).json({
      success: false,
      message:
        'A transaction with this reference ID already exists for this account.',
    });
    return;
  }

  // 5. Validation errors -> 400
  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // 6. JSON syntax parse errors
  if (
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'body' in error
  ) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON payload.',
    });
    return;
  }

  // 7. Unexpected internal error -> 500
  console.error('Unexpected error:', error);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
}
