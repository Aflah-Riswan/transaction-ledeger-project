export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AccountNotFoundError extends Error {
  constructor(message: string = 'Account not found.') {
    super(message);
    this.name = 'AccountNotFoundError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(message: string = 'Insufficient balance to complete this debit.') {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

export class DuplicateReferenceError extends Error {
  constructor(
    message: string = 'A transaction with this reference ID already exists for this account.',
  ) {
    super(message);
    this.name = 'DuplicateReferenceError';
  }
}

// Aliases for backwards compatibility with existing codebase
export class SameAccountTransactionError extends DuplicateReferenceError {}

export class InvalidTransactionError extends ValidationError {}
