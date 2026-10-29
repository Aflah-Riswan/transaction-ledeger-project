import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { TransactionController } from '../controllers/TransactionController';

export function createAccountRoutes(
  accountController: AccountController,
  transactionController: TransactionController,
): Router {
  const router = Router();

  // Account endpoints
  router.post('/', accountController.createAccount);
  router.get('/:accountId/balance', accountController.getBalance);

  // Nested transaction endpoints
  router.post('/:accountId/transactions', transactionController.addTransaction);
  router.get('/:accountId/transactions', transactionController.getHistory);

  return router;
}
