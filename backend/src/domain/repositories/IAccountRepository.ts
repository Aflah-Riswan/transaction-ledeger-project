import { Account } from '../entities/Account';

export interface IAccountRepository {
  create(account: Account): Promise<Account>;
  findById(id: string): Promise<Account | null>;
  updateBalance(id: string, amountDelta: number): Promise<Account | null>;
}
