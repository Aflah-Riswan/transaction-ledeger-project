import { Request, Response, NextFunction } from 'express';
import { CreateAccount } from '../../application/use-cases/CreateAccount';
import { GetAccountBalance } from '../../application/use-cases/GetAccountBalance';
import {
  validateAccountId,
  validateAccountName,
} from '../validators/requestValidators';

export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccount,
    private readonly getAccountBalanceUseCase: GetAccountBalance,
  ) {}

  createAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const name = validateAccountName(req.body?.name);
      const account = await this.createAccountUseCase.execute(name);

      res.status(201).json({
        success: true,
        data: {
          id: account.id,
          name: account.name,
          balance: account.balance,
          created_at: account.createdAt,
          createdAt: account.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getBalance = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accountId = validateAccountId(
        req.params.accountId || req.params.id,
      );
      const result = await this.getAccountBalanceUseCase.execute(accountId);

      res.status(200).json({
        success: true,
        data: {
          account_id: result.accountId,
          accountId: result.accountId,
          balance: result.balance,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
