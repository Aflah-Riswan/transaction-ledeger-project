import express, { Express } from 'express';
import cors from 'cors';
import { IAccountRepository } from './domain/repositories/IAccountRepository';
import { ITransactionRepository } from './domain/repositories/ITransactionRepository';
import { MongoAccountRepository } from './infrastructure/database/repositories/MongoAccountRepository';
import { MongoTransactionRepository } from './infrastructure/database/repositories/MongoTransactionRepository';
import { CreateAccount } from './application/use-cases/CreateAccount';
import { GetAccountBalance } from './application/use-cases/GetAccountBalance';
import { GetAllAccounts } from './application/use-cases/GetAllAccounts';
import { AddTransaction } from './application/use-cases/AddTransaction';
import { GetTransactionHistory } from './application/use-cases/GetTransactionHistory';
import { AccountController } from './presentation/controllers/AccountController';
import { TransactionController } from './presentation/controllers/TransactionController';
import { createAccountRoutes } from './presentation/routes/accountRoutes';
import { errorHandler } from './presentation/middleware/errorHandler';

export interface AppDependencies {
  accountRepository?: IAccountRepository;
  transactionRepository?: ITransactionRepository;
}

export function createApp(dependencies?: AppDependencies): Express {
  const app = express();

  const accountRepository =
    dependencies?.accountRepository ?? new MongoAccountRepository();
  const transactionRepository =
    dependencies?.transactionRepository ?? new MongoTransactionRepository();

  const createAccountUseCase = new CreateAccount(accountRepository);
  const getAccountBalanceUseCase = new GetAccountBalance(accountRepository);
  const getAllAccountsUseCase = new GetAllAccounts(accountRepository);
  const addTransactionUseCase = new AddTransaction(
    accountRepository,
    transactionRepository,
  );
  const getTransactionHistoryUseCase = new GetTransactionHistory(
    accountRepository,
    transactionRepository,
  );

  const accountController = new AccountController(
    createAccountUseCase,
    getAccountBalanceUseCase,
    getAllAccountsUseCase,
  );
  const transactionController = new TransactionController(
    addTransactionUseCase,
    getTransactionHistoryUseCase,
  );

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || '*',
    }),
  );
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'server is healthy',
    });
  });

  app.use(
    '/api/accounts',
    createAccountRoutes(accountController, transactionController),
  );

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found.',
    });
  });

  // Centralized error-handling middleware
  app.use(errorHandler);

  return app;
}
