import { Request, Response, NextFunction } from 'express';
import { AddTransaction } from '../../application/use-cases/AddTransaction';
import { GetTransactionHistory } from '../../application/use-cases/GetTransactionHistory';
import { TransactionType } from '../../domain/entities/Transaction';
import {
  validateAccountId,
  validateAmount,
  validatePagination,
  validateReferenceId,
  validateTransactionType,
} from '../validators/requestValidators';

export class TransactionController {
  constructor(
    private readonly addTransactionUseCase: AddTransaction,
    private readonly getTransactionHistoryUseCase: GetTransactionHistory,
  ) {}

  addTransaction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accountId = validateAccountId(
        req.params.accountId || req.params.id,
      );
      const type = validateTransactionType(req.body?.type);
      const amount = validateAmount(req.body?.amount);
      const referenceId = validateReferenceId(
        req.body?.referenceId ?? req.body?.reference_id,
      );
      const description =
        typeof req.body?.description === 'string'
          ? req.body.description.trim()
          : '';

      const result = await this.addTransactionUseCase.execute({
        accountId,
        type,
        amount,
        referenceId,
        description,
      });

      res.status(201).json({
        success: true,
        data: {
          id: result.transaction.id,
          account_id: result.transaction.accountId,
          accountId: result.transaction.accountId,
          type: result.transaction.type,
          amount: result.transaction.amount,
          description: result.transaction.description,
          reference_id: result.transaction.referenceId,
          referenceId: result.transaction.referenceId,
          created_at: result.transaction.createdAt,
          createdAt: result.transaction.createdAt,
          new_balance: result.newBalance,
          newBalance: result.newBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accountId = validateAccountId(
        req.params.accountId || req.params.id,
      );

      let type: TransactionType | undefined;
      if (req.query.type !== undefined && req.query.type !== '') {
        type = validateTransactionType(req.query.type);
      }

      const { page, limit } = validatePagination(
        req.query.page,
        req.query.limit,
      );

      const result = await this.getTransactionHistoryUseCase.execute({
        accountId,
        type,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: {
          transactions: result.transactions.map((item) => ({
            id: item.id,
            account_id: item.accountId,
            accountId: item.accountId,
            type: item.type,
            amount: item.amount,
            description: item.description,
            reference_id: item.referenceId,
            referenceId: item.referenceId,
            created_at: item.createdAt,
            createdAt: item.createdAt,
          })),
          page: result.page,
          limit: result.limit,
          current_page: result.page,
          page_size: result.limit,
          total_records: result.totalRecords,
          totalRecords: result.totalRecords,
          total_pages: result.totalPages,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
