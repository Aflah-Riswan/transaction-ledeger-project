import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { Account, Transaction, TransactionType } from './types';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { AccountBanner } from './components/AccountBanner';
import { CreateAccountForm } from './components/CreateAccountForm';
import { AddTransactionForm } from './components/AddTransactionForm';
import { TransactionHistory } from './components/TransactionHistory';

export function App() {
  // Accounts State (Pure in-memory state; ZERO localStorage)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Loading States
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Transaction History State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Alert State
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch all accounts from backend on mount
  const fetchAccounts = useCallback(async () => {
    try {
      const fetched = await api.getAccounts();
      setAccounts(fetched);
      if (fetched.length > 0 && !selectedAccountId) {
        setSelectedAccountId(fetched[0].id);
        setCurrentAccount(fetched[0]);
        setBalance(fetched[0].balance);
      }
    } catch (err: unknown) {
      console.warn('Could not auto-fetch accounts list:', err);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Fetch balance for the currently selected account
  const fetchBalance = useCallback(async (accountId: string) => {
    if (!accountId) return;
    setIsRefreshingBalance(true);
    try {
      const data = await api.getAccountBalance(accountId);
      setBalance(data.balance);
    } catch (err: unknown) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to fetch account balance.',
      });
    } finally {
      setIsRefreshingBalance(false);
    }
  }, []);

  // Fetch transaction history
  const fetchHistory = useCallback(
    async (accountId: string, filter: 'all' | 'credit' | 'debit', page: number) => {
      if (!accountId) return;
      setIsLoadingHistory(true);
      try {
        const typeParam = filter === 'all' ? undefined : filter;
        const res = await api.getTransactionHistory(accountId, typeParam, page, 5);
        setTransactions(res.transactions || []);
        setCurrentPage(res.page || res.current_page || page);
        setTotalPages(res.totalPages || res.total_pages || 1);
        setTotalRecords(res.totalRecords || res.total_records || 0);
      } catch (err: unknown) {
        console.error('Failed to fetch history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [],
  );

  // Synchronize when selected account or filters change
  useEffect(() => {
    if (selectedAccountId) {
      const found = accounts.find((a) => a.id === selectedAccountId);
      if (found) {
        setCurrentAccount(found);
      }
      fetchBalance(selectedAccountId);
      fetchHistory(selectedAccountId, historyFilter, currentPage);
    } else {
      setCurrentAccount(null);
      setBalance(null);
      setTransactions([]);
    }
  }, [selectedAccountId, historyFilter, currentPage, fetchBalance, fetchHistory, accounts]);

  // Handle Account Selection
  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    setCurrentPage(1);
    const found = accounts.find((a) => a.id === id);
    if (found) {
      setCurrentAccount(found);
    }
  };

  // Handle Load Account by ID directly
  const handleLoadById = async (id: string) => {
    try {
      const balRes = await api.getAccountBalance(id);
      const existing = accounts.find((a) => a.id === id);
      const acc: Account = existing || {
        id,
        name: `Account (${id.slice(-6)})`,
        balance: balRes.balance,
        created_at: new Date().toISOString(),
      };

      if (!existing) {
        setAccounts((prev) => [acc, ...prev]);
      }
      setSelectedAccountId(id);
      setCurrentAccount(acc);
      setBalance(balRes.balance);
      setCurrentPage(1);
      setAlert({ type: 'success', message: `Account ${id} loaded successfully.` });
    } catch (err: unknown) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Account not found.',
      });
    }
  };

  // Handle Create Account
  const handleCreateAccount = async (name: string) => {
    setIsCreatingAccount(true);
    setAlert(null);
    try {
      const created = await api.createAccount(name);
      setAccounts((prev) => [created, ...prev]);
      setSelectedAccountId(created.id);
      setCurrentAccount(created);
      setBalance(0);
      setAlert({
        type: 'success',
        message: `Account "${created.name}" created successfully with initial balance 0.`,
      });
    } catch (err: unknown) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to create account.',
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Handle Add Transaction
  const handleAddTransaction = async (data: {
    type: TransactionType;
    amount: number;
    referenceId: string;
    description?: string;
  }) => {
    if (!selectedAccountId) return;

    setIsSubmittingTx(true);
    setAlert(null);
    try {
      const res = await api.addTransaction({
        accountId: selectedAccountId,
        type: data.type,
        amount: data.amount,
        referenceId: data.referenceId,
        description: data.description,
      });

      const updatedBalance = res.new_balance ?? res.newBalance;
      if (typeof updatedBalance === 'number') {
        setBalance(updatedBalance);
      } else {
        await fetchBalance(selectedAccountId);
      }

      setAlert({
        type: 'success',
        message: `${data.type.toUpperCase()} transaction of ${data.amount} processed successfully! Ref: ${
          res.reference_id || res.referenceId
        }`,
      });

      // Refresh history to page 1
      setCurrentPage(1);
      fetchHistory(selectedAccountId, historyFilter, 1);
    } catch (err: unknown) {
      setAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Transaction failed.',
      });
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header Component */}
      <Header
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={handleSelectAccount}
        onLoadById={handleLoadById}
      />

      <main className="main-content">
        {/* Alert Notifications */}
        <AlertBanner alert={alert} onClose={() => setAlert(null)} />

        {/* Active Account Banner */}
        <AccountBanner
          account={currentAccount}
          balance={balance}
          onRefreshBalance={() => selectedAccountId && fetchBalance(selectedAccountId)}
          isRefreshing={isRefreshingBalance}
        />

        {/* Action Grid: Create Account & Add Transaction */}
        <div className="dashboard-grid">
          <CreateAccountForm
            onCreateAccount={handleCreateAccount}
            isCreating={isCreatingAccount}
          />

          <AddTransactionForm
            selectedAccountId={selectedAccountId}
            onAddTransaction={handleAddTransaction}
            isSubmitting={isSubmittingTx}
            onError={(msg) => setAlert({ type: 'error', message: msg })}
          />
        </div>

        {/* Transaction History Component */}
        <TransactionHistory
          selectedAccountId={selectedAccountId}
          transactions={transactions}
          filter={historyFilter}
          onFilterChange={(f) => {
            setHistoryFilter(f);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          isLoading={isLoadingHistory}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Transaction Ledger System &bull; Clean Architecture & Live Database Sync</p>
      </footer>
    </div>
  );
}

export default App;
