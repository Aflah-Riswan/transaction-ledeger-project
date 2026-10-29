import { Account } from '../../domain/entities/Account';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export class CreateAccount {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(name: string): Promise<Account> {
    const account = Account.create(name);

    return this.accountRepository.create(account);
  }
}