import { Types } from 'mongoose';
import { Transaction } from '../../../domain/entities/Transaction';
import {
  ITransactionRepository,
  TransactionHistoryQuery,
  TransactionHistoryResult,
} from '../../../domain/repositories/ITransactionRepository';
import { TransactionModel } from '../models/Transaction';

export class MongoTransactionRepository implements ITransactionRepository {
  async create(transaction: Transaction): Promise<Transaction> {
    const saved = await TransactionModel.create({
      accountId: new Types.ObjectId(transaction.accountId),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt,
    });

    return Transaction.fromData({
      id: saved._id.toString(),
      accountId: saved.accountId.toString(),
      type: saved.type,
      amount: saved.amount,
      description: saved.description,
      referenceId: saved.referenceId,
      createdAt: saved.createdAt,
    });
  }

  async findByReference(
    accountId: string,
    referenceId: string,
  ): Promise<Transaction | null> {
    if (!Types.ObjectId.isValid(accountId)) {
      return null;
    }

    const transaction = await TransactionModel.findOne({
      accountId: new Types.ObjectId(accountId),
      referenceId,
    }).exec();

    if (!transaction) {
      return null;
    }

    return Transaction.fromData({
      id: transaction._id.toString(),
      accountId: transaction.accountId.toString(),
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      referenceId: transaction.referenceId,
      createdAt: transaction.createdAt,
    });
  }

  async findHistory(
    query: TransactionHistoryQuery,
  ): Promise<TransactionHistoryResult> {
    const { accountId, type, page, limit } = query;

    if (!Types.ObjectId.isValid(accountId)) {
      return {
        transactions: [],
        page,
        limit,
        totalRecords: 0,
        totalPages: 0,
      };
    }

    const filter: {
      accountId: Types.ObjectId;
      type?: 'credit' | 'debit';
    } = { accountId: new Types.ObjectId(accountId) };

    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [records, totalRecords] = await Promise.all([
      TransactionModel.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      TransactionModel.countDocuments(filter).exec(),
    ]);

    const transactions = records.map((record) =>
      Transaction.fromData({
        id: record._id.toString(),
        accountId: record.accountId.toString(),
        type: record.type,
        amount: record.amount,
        description: record.description,
        referenceId: record.referenceId,
        createdAt: record.createdAt,
      }),
    );

    return {
      transactions,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }
}
