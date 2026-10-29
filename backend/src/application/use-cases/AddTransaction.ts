import {
  Transaction,
  TransactionType,
} from '../../domain/entities/Transaction';
import {
  AccountNotFoundError,
  DuplicateReferenceError,
  InsufficientBalanceError,
} from '../../domain/errors/DomainErrors';
import { IAccountRepository } from '../../domain/repositories/IAccountRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export interface AddTransactionInput {
  accountId: string;
  type: TransactionType;
  amount: number;
  referenceId: string;
  description?: string;
}

export interface AddTransactionResult {
  transaction: Transaction;
  newBalance: number;
}

export class AddTransaction {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(input: AddTransactionInput): Promise<AddTransactionResult> {
    const { accountId, type, amount, referenceId, description } = input;

    // 1. Verify account exists
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError();
    }

    // 2. Check for duplicate reference ID for this account
    const existingTransaction =
      await this.transactionRepository.findByReference(accountId, referenceId);
    if (existingTransaction) {
      throw new DuplicateReferenceError();
    }

    // 3. For debit, check available balance
    if (type === 'debit' && account.balance < amount) {
      throw new InsufficientBalanceError();
    }

    // 4. Atomically update the account balance
    const balanceDelta = type === 'debit' ? -amount : amount;
    const updatedAccount = await this.accountRepository.updateBalance(
      accountId,
      balanceDelta,
    );

    if (!updatedAccount) {
      if (type === 'debit') {
        throw new InsufficientBalanceError();
      }
      throw new AccountNotFoundError();
    }

    // 5. Create and persist the transaction record
    const transaction = Transaction.create({
      accountId,
      type,
      amount,
      referenceId,
      description,
    });

    try {
      const createdTransaction =
        await this.transactionRepository.create(transaction);

      return {
        transaction: createdTransaction,
        newBalance: updatedAccount.balance,
      };
    } catch (error: unknown) {
      // Revert the balance update if transaction creation fails
      await this.accountRepository
        .updateBalance(accountId, -balanceDelta)
        .catch(() => {});

      if ((error as { code?: number })?.code === 11000) {
        throw new DuplicateReferenceError();
      }
      throw error;
    }
  }
}
