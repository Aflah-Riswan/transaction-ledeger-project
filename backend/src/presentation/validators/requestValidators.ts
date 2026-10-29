import { TransactionType } from '../../domain/entities/Transaction';
import { ValidationError } from '../../domain/errors/DomainErrors';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function validateAccountId(id: unknown): string {
  if (typeof id !== 'string' || !OBJECT_ID_REGEX.test(id.trim())) {
    throw new ValidationError('Invalid account ID format.');
  }
  return id.trim();
}

export function validateAccountName(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new ValidationError('Account name is required.');
  }
  return name.trim();
}

export function validateTransactionType(type: unknown): TransactionType {
  if (type !== 'credit' && type !== 'debit') {
    throw new ValidationError('Transaction type must be credit or debit.');
  }
  return type;
}

export function validateAmount(amount: unknown): number {
  if (typeof amount === 'string') {
    // Disallow numbers with leading zeros (e.g. "099") or non-integer formats
    if (!/^[1-9]\d*$/.test(amount.trim())) {
      throw new ValidationError('Amount must be greater than zero.');
    }
    amount = Number(amount);
  }

  if (
    typeof amount !== 'number' ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new ValidationError('Amount must be greater than zero.');
  }
  return amount;
}

export function validateReferenceId(referenceId: unknown): string {
  if (typeof referenceId !== 'string' || !referenceId.trim()) {
    throw new ValidationError('Reference ID is required.');
  }
  return referenceId.trim();
}

export function validatePagination(
  rawPage: unknown,
  rawLimit: unknown,
): { page: number; limit: number } {
  let page = 1;
  let limit = 10;

  if (rawPage !== undefined && rawPage !== null && rawPage !== '') {
    const parsedPage = Number(rawPage);
    if (!Number.isInteger(parsedPage) || parsedPage <= 0) {
      throw new ValidationError(
        'Page and limit must be valid positive integers.',
      );
    }
    page = parsedPage;
  }

  if (rawLimit !== undefined && rawLimit !== null && rawLimit !== '') {
    const parsedLimit = Number(rawLimit);
    if (!Number.isInteger(parsedLimit) || parsedLimit <= 0) {
      throw new ValidationError(
        'Page and limit must be valid positive integers.',
      );
    }
    limit = Math.min(parsedLimit, 100);
  }

  return { page, limit };
}
