import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  History,
  Sparkles,
} from 'lucide-react';
import { api } from './api';
import type { Account, Transaction, TransactionType } from './types';

export function App() {
  // Accounts State
  const [savedAccounts, setSavedAccounts] = useState<Account[]>(() => {
    try {
      const stored = localStorage.getItem('saved_accounts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    try {
      return localStorage.getItem('selected_account_id') || '';
    } catch {
      return '';
    }
  });

  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  // Form State - Create Account
  const [newAccountName, setNewAccountName] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Form State - Add Transaction
  const [txType, setTxType] = useState<TransactionType>('credit');
  const [txAmount, setTxAmount] = useState('');
  const [txReferenceId, setTxReferenceId] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Transaction History State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // UI Feedback State
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Save accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('saved_accounts', JSON.stringify(savedAccounts));
    } catch {
      // ignore
    }
  }, [savedAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('selected_account_id', selectedAccountId);
    } catch {
      // ignore
    }
  }, [selectedAccountId]);

  // Fetch current account balance
  const fetchBalance = useCallback(async (accountId: string) => {
    if (!accountId) return;
    try {
      const data = await api.getAccountBalance(accountId);
      setBalance(data.balance);
    } catch (err: unknown) {
      console.error('Failed to fetch balance:', err);
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
      const acc = savedAccounts.find((a) => a.id === selectedAccountId);
      if (acc) {
        setCurrentAccount(acc);
      }
      fetchBalance(selectedAccountId);
      fetchHistory(selectedAccountId, historyFilter, currentPage);
    } else {
      setCurrentAccount(null);
      setBalance(null);
      setTransactions([]);
    }
  }, [selectedAccountId, historyFilter, currentPage, fetchBalance, fetchHistory, savedAccounts]);

  // Generate unique reference ID
  const generateReferenceId = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setTxReferenceId(`REF-${Date.now().toString().slice(-6)}-${randomHex}`);
  };

  // Handle Account Creation
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) {
      setAlert({ type: 'error', message: 'Account name is required.' });
      return;
    }

    setIsCreatingAccount(true);
    setAlert(null);
    try {
      const created = await api.createAccount(newAccountName.trim());
      setSavedAccounts((prev) => [created, ...prev]);
      setSelectedAccountId(created.id);
      setCurrentAccount(created);
      setBalance(0);
      setNewAccountName('');
      setAlert({
        type: 'success',
        message: `Account "${created.name}" created successfully with initial balance ₹0.`,
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

  // Handle Adding Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      setAlert({ type: 'error', message: 'Please select an account first.' });
      return;
    }

    const amountNum = Number(txAmount);
    if (!Number.isSafeInteger(amountNum) || amountNum <= 0) {
      setAlert({ type: 'error', message: 'Amount must be a positive integer greater than zero.' });
      return;
    }

    if (!txReferenceId.trim()) {
      setAlert({ type: 'error', message: 'Reference ID is required.' });
      return;
    }

    setIsSubmittingTx(true);
    setAlert(null);

    try {
      const result = await api.addTransaction({
        accountId: selectedAccountId,
        type: txType,
        amount: amountNum,
        referenceId: txReferenceId.trim(),
        description: txDescription.trim() || undefined,
      });

      const updatedBalance = result.new_balance ?? result.newBalance;
      if (typeof updatedBalance === 'number') {
        setBalance(updatedBalance);
      } else {
        await fetchBalance(selectedAccountId);
      }

      setAlert({
        type: 'success',
        message: `${txType.toUpperCase()} of ${amountNum} minor units successfully processed! Ref: ${result.reference_id || result.referenceId}`,
      });

      // Reset form
      setTxAmount('');
      setTxReferenceId('');
      setTxDescription('');

      // Refresh history back to first page
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

  // Copy Account ID Helper
  const handleCopyAccountId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <div className="brand-icon">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="brand-title">Transaction Ledger</h1>
              <p className="brand-subtitle">Financial Accounting & Ledger System</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {savedAccounts.length > 0 && (
              <select
                className="form-input"
                style={{ padding: '0.4rem 0.75rem', width: 'auto', fontSize: '0.875rem' }}
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {savedAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.id.slice(-6)})
                  </option>
                ))}
              </select>
            )}

            <div className="header-status">
              <span className="status-dot"></span>
              <span>API Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Alerts */}
        {alert && (
          <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span>{alert.message}</span>
            <button className="alert-close" onClick={() => setAlert(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Selected Account Banner */}
        {selectedAccountId && currentAccount ? (
          <div className="account-banner">
            <div className="account-info-header">
              <span className="account-name-label">Active Account</span>
              <span className="account-name-val">{currentAccount.name}</span>
              <span
                className="account-id-chip"
                onClick={() => handleCopyAccountId(selectedAccountId)}
                title="Click to copy full Account ID"
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>ID: {selectedAccountId}</span>
              </span>
            </div>

            <div className="account-balance-display">
              <span className="balance-title">Current Ledger Balance</span>
              <span className="balance-amount">{balance !== null ? balance.toLocaleString() : '—'}</span>
              <div className="balance-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => fetchBalance(selectedAccountId)}
                  title="Refresh Balance"
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f1f5f9' }}>
            <Wallet size={40} style={{ margin: '0 auto 0.75rem', color: '#64748b' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>No Account Selected</h3>
            <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
              Create an account below to start recording credit and debit ledger transactions.
            </p>
          </div>
        )}

        {/* Action Grid: Create Account & Add Transaction */}
        <div className="dashboard-grid">
          {/* Card: Create Account */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <PlusCircle size={20} color="#2563eb" />
                <span>Create Account</span>
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleCreateAccount}>
                <div className="form-group">
                  <label className="form-label" htmlFor="accountName">
                    Account Holder Name
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Savings Ledger, Alice Doe"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    disabled={isCreatingAccount}
                  />
                  <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                    Initial balance is always set to 0. Unique ID generated automatically.
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isCreatingAccount || !newAccountName.trim()}
                >
                  {isCreatingAccount ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </div>
          </div>

          {/* Card: Add Transaction */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <CreditCard size={20} color="#2563eb" />
                <span>Add Transaction</span>
              </h2>
              {selectedAccountId && (
                <span className="mono-text" style={{ fontSize: '0.75rem' }}>
                  To: {selectedAccountId.slice(-8)}
                </span>
              )}
            </div>
            <div className="card-body">
              {!selectedAccountId ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  Please select or create an account first.
                </div>
              ) : (
                <form onSubmit={handleAddTransaction}>
                  {/* Credit / Debit Buttons */}
                  <div className="type-selector">
                    <button
                      type="button"
                      className={`type-btn ${txType === 'credit' ? 'active-credit' : ''}`}
                      onClick={() => setTxType('credit')}
                    >
                      <ArrowDownLeft size={18} />
                      <span>Credit (Deposit)</span>
                    </button>
                    <button
                      type="button"
                      className={`type-btn ${txType === 'debit' ? 'active-debit' : ''}`}
                      onClick={() => setTxType('debit')}
                    >
                      <ArrowUpRight size={18} />
                      <span>Debit (Withdraw)</span>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="txAmount">
                      Amount (Positive Integer Minor Units)
                    </label>
                    <input
                      id="txAmount"
                      type="number"
                      step="1"
                      min="1"
                      className="form-input"
                      placeholder="e.g. 1000"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      disabled={isSubmittingTx}
                    />
                  </div>

                  {/* Reference ID Input with Generator */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="txRef">
                      Reference ID (Unique per account)
                    </label>
                    <div className="input-with-button">
                      <input
                        id="txRef"
                        type="text"
                        className="form-input"
                        placeholder="e.g. TX-SALARY-OCT"
                        value={txReferenceId}
                        onChange={(e) => setTxReferenceId(e.target.value)}
                        disabled={isSubmittingTx}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={generateReferenceId}
                        title="Generate random reference ID"
                      >
                        <Sparkles size={14} />
                        <span>Generate</span>
                      </button>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="txDesc">
                      Description (Optional)
                    </label>
                    <input
                      id="txDesc"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Monthly salary, utility bill payment"
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                      disabled={isSubmittingTx}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isSubmittingTx || !txAmount || !txReferenceId.trim()}
                  >
                    {isSubmittingTx
                      ? 'Processing...'
                      : `Execute ${txType === 'credit' ? 'Credit' : 'Debit'} Transaction`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <History size={20} color="#2563eb" />
              <span>Transaction History</span>
            </h2>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${historyFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setHistoryFilter('all');
                  setCurrentPage(1);
                }}
              >
                All
              </button>
              <button
                className={`filter-tab ${historyFilter === 'credit' ? 'active' : ''}`}
                onClick={() => {
                  setHistoryFilter('credit');
                  setCurrentPage(1);
                }}
              >
                Credit
              </button>
              <button
                className={`filter-tab ${historyFilter === 'debit' ? 'active' : ''}`}
                onClick={() => {
                  setHistoryFilter('debit');
                  setCurrentPage(1);
                }}
              >
                Debit
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            {!selectedAccountId ? (
              <div className="empty-state">
                <p>Select an account to view its ledger entries.</p>
              </div>
            ) : isLoadingHistory ? (
              <div className="empty-state">
                <RefreshCw className="empty-icon animate-spin" />
                <p>Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <History className="empty-icon" />
                <p>No transactions found for this account.</p>
              </div>
            ) : (
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reference ID</th>
                    <th>Description</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <span
                          className={`badge ${tx.type === 'credit' ? 'badge-credit' : 'badge-debit'}`}
                        >
                          {tx.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`amount-cell ${tx.type === 'credit' ? 'amount-credit' : 'amount-debit'}`}>
                        {tx.type === 'credit' ? '+' : '-'}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td>
                        <span className="mono-text">{tx.reference_id || tx.referenceId}</span>
                      </td>
                      <td>{tx.description || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td className="mono-text">
                        {new Date(tx.created_at || tx.createdAt || '').toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {selectedAccountId && transactions.length > 0 && (
            <div className="pagination-bar">
              <div>
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRecords} records)
              </div>
              <div className="pagination-controls">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={currentPage <= 1 || isLoadingHistory}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={currentPage >= totalPages || isLoadingHistory}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Transaction Ledger System &copy; 2026 &bull; Strict Double-Entry & Idempotency Rules</p>
      </footer>
    </div>
  );
}

export default App;
