import { Types } from 'mongoose';
import { Account } from '../../../domain/entities/Account';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { AccountModel } from '../models/AccountModel';

export class MongoAccountRepository implements IAccountRepository {
  async create(account: Account): Promise<Account> {
    const saved = await AccountModel.create({
      name: account.name,
      balance: account.balance,
      createdAt: account.createdAt,
    });

    return Account.fromData({
      id: saved._id.toString(),
      name: saved.name,
      balance: saved.balance,
      createdAt: saved.createdAt,
    });
  }

  async findById(id: string): Promise<Account | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const account = await AccountModel.findById(id).exec();
    if (!account) {
      return null;
    }

    return Account.fromData({
      id: account._id.toString(),
      name: account.name,
      balance: account.balance,
      createdAt: account.createdAt,
    });
  }

  async findAll(): Promise<Account[]> {
    const accounts = await AccountModel.find().sort({ createdAt: -1 }).exec();
    return accounts.map((account) =>
      Account.fromData({
        id: account._id.toString(),
        name: account.name,
        balance: account.balance,
        createdAt: account.createdAt,
      }),
    );
  }

  async updateBalance(id: string, amountDelta: number): Promise<Account | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const filter: Record<string, unknown> = { _id: id };
    if (amountDelta < 0) {
      // Debit: conditionally update only if balance is sufficient
      filter.balance = { $gte: Math.abs(amountDelta) };
    }

    const updated = await AccountModel.findOneAndUpdate(
      filter,
      { $inc: { balance: amountDelta } },
      { returnDocument: 'after' },
    ).exec();

    if (!updated) {
      return null;
    }

    return Account.fromData({
      id: updated._id.toString(),
      name: updated.name,
      balance: updated.balance,
      createdAt: updated.createdAt,
    });
  }
}
