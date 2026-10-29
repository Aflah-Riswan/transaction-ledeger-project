import { TransactionType } from '../../domain/entities/Transaction';
import { AccountNotFoundError } from '../../domain/errors/DomainErrors';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import {
  ITransactionRepository,
  TransactionHistoryResult,
} from '../../domain/repositories/ITransactionRepository';

export interface GetTransactionHistoryInput {
  accountId: string;
  type?: TransactionType;
  page?: number;
  limit?: number;
}

export class GetTransactionHistory {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    input: GetTransactionHistoryInput,
  ): Promise<TransactionHistoryResult> {
    const { accountId, type } = input;
    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 10));

    // Verify account exists
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError();
    }

    return this.transactionRepository.findHistory({
      accountId,
      type,
      page,
      limit,
    });
  }
}
