import { ValidationError } from '../errors/DomainErrors';

export type TransactionType = 'credit' | 'debit';

export interface TransactionProps {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string;
  createdAt: Date;
}

export interface CreateTransactionProps {
  accountId: string;
  type: TransactionType;
  amount: number;
  referenceId: string;
  description?: string;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static create(data: CreateTransactionProps): Transaction {
    const normalizedAccountId = (data.accountId || '').trim();
    if (!normalizedAccountId) {
      throw new ValidationError('Account ID is required.');
    }

    if (data.type !== 'credit' && data.type !== 'debit') {
      throw new ValidationError('Transaction type must be credit or debit.');
    }

    if (!Number.isSafeInteger(data.amount) || data.amount <= 0) {
      throw new ValidationError('Amount must be greater than zero.');
    }

    const normalizedReferenceId = (data.referenceId || '').trim();
    if (!normalizedReferenceId) {
      throw new ValidationError('Reference ID is required.');
    }

    const normalizedDescription = (data.description || '').trim();

    return new Transaction({
      id: '',
      accountId: normalizedAccountId,
      type: data.type,
      amount: data.amount,
      description: normalizedDescription,
      referenceId: normalizedReferenceId,
      createdAt: new Date(),
    });
  }

  static fromData(data: TransactionProps): Transaction {
    return new Transaction(data);
  }

  get id(): string {
    return this.props.id;
  }

  get accountId(): string {
    return this.props.accountId;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get amount(): number {
    return this.props.amount;
  }

  get description(): string {
    return this.props.description;
  }

  get referenceId(): string {
    return this.props.referenceId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
