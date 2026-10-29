
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

export class Transaction {
  private constructor(
    private readonly props: TransactionProps,
  ) {}

  static create(
    data: Omit<TransactionProps, 'id' | 'createdAt'>,
  ): Transaction {
    if (!data.accountId.trim()) {
      throw new Error('Account ID is required');
    }

    if (
      data.type !== 'credit' &&
      data.type !== 'debit'
    ) {
      throw new Error('Transaction type must be credit or debit');
    }

    if (
      !Number.isSafeInteger(data.amount) ||
      data.amount <= 0
    ) {
      throw new Error('Amount must be a positive integer in paise');
    }

    if (!data.referenceId.trim()) {
      throw new Error('Reference ID is required');
    }

    if (!data.description.trim()) {
      throw new Error('Description is required');
    }

    return new Transaction({
      ...data,
      id: '',
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
