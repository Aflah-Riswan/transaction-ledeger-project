import { AccountNotFoundError } from '../../domain/errors/DomainErrors';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export interface AccountBalanceResult {
  accountId: string;
  balance: number;
}

export class GetAccountBalance {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async execute(accountId: string): Promise<AccountBalanceResult> {
    const account = await this.accountRepository.findById(accountId);

    if (!account) {
      throw new AccountNotFoundError();
    }

    return {
      accountId: account.id,
      balance: account.balance,
    };
  }
}
