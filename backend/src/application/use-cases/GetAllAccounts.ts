import { Account } from '../../domain/entities/Account';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';

export class GetAllAccounts {
  constructor(private readonly accountRepository: IAccountRepository) {}

  async execute(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }
}
