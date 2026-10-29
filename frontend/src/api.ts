import type {
  Account,
  ApiResponse,
  Transaction,
  TransactionHistoryResponse,
  TransactionType,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: 'Failed to parse server response.',
  }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return json.data as T;
}

export const api = {
  async createAccount(name: string): Promise<Account> {
    return request<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getAccountBalance(
    accountId: string,
  ): Promise<{ account_id: string; balance: number }> {
    return request<{ account_id: string; balance: number }>(
      `/accounts/${accountId}/balance`,
    );
  },

  async addTransaction(input: {
    accountId: string;
    type: TransactionType;
    amount: number;
    referenceId: string;
    description?: string;
  }): Promise<Transaction> {
    return request<Transaction>(`/accounts/${input.accountId}/transactions`, {
      method: 'POST',
      body: JSON.stringify({
        type: input.type,
        amount: input.amount,
        reference_id: input.referenceId,
        referenceId: input.referenceId,
        description: input.description,
      }),
    });
  },

  async getTransactionHistory(
    accountId: string,
    type?: TransactionType,
    page: number = 1,
    limit: number = 10,
  ): Promise<TransactionHistoryResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (type) {
      params.append('type', type);
    }
    return request<TransactionHistoryResponse>(
      `/accounts/${accountId}/transactions?${params.toString()}`,
    );
  },
};
