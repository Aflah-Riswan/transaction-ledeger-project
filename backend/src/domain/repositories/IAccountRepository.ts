import { Account } from '../entities/Account';

export interface AccountRepository {
  create(account: Account): Promise<Account>;

  findById(id: string): Promise<Account | null>;
}