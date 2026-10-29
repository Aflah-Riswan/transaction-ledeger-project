import {
  Transaction,
  TransactionType,
} from '../entities/Transaction';

export interface TransactionHistoryQuery {
  accountId: string;
  type?: TransactionType;
  page: number;
  limit: number;
}

export interface TransactionHistoryResult {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;

  findByReference(
    accountId: string,
    referenceId: string,
  ): Promise<Transaction | null>;

  findHistory(
    query: TransactionHistoryQuery,
  ): Promise<TransactionHistoryResult>;
}