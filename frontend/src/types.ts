export interface Account {
  id: string;
  name: string;
  balance: number;
  created_at: string;
  createdAt?: string;
}

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  account_id: string;
  accountId?: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference_id: string;
  referenceId?: string;
  created_at: string;
  createdAt?: string;
  new_balance?: number;
  newBalance?: number;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  current_page?: number;
  page_size?: number;
  total_records?: number;
  total_pages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
