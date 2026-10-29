import { useState, type FC } from 'react';
import { Copy, Check, RefreshCw, Wallet } from 'lucide-react';
import type { Account } from '../types';

interface AccountBannerProps {
  account: Account | null;
  balance: number | null;
  onRefreshBalance: () => void;
  isRefreshing?: boolean;
}

export const AccountBanner: FC<AccountBannerProps> = ({
  account,
  balance,
  onRefreshBalance,
  isRefreshing,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) {
    return (
      <div
        className="card"
        style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f1f5f9' }}
      >
        <Wallet size={40} style={{ margin: '0 auto 0.75rem', color: '#64748b' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          No Account Selected
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
          Create an account below or select one to view its balance and record transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="account-banner">
      <div className="account-info-header">
        <span className="account-name-label">Active Account</span>
        <span className="account-name-val">{account.name}</span>
        <span
          className="account-id-chip"
          onClick={() => handleCopy(account.id)}
          title="Click to copy full Account ID"
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          <span>ID: {account.id}</span>
        </span>
      </div>

      <div className="account-balance-display">
        <span className="balance-title">Current Ledger Balance</span>
        <span className="balance-amount">
          {balance !== null ? balance.toLocaleString() : '—'}
        </span>
        <div className="balance-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefreshBalance}
            disabled={isRefreshing}
            title="Refresh current balance"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
