import { useState, type FC } from 'react';
import { Wallet, Search } from 'lucide-react';
import type { Account } from '../types';

interface HeaderProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onLoadById: (id: string) => void;
}

export const Header: FC<HeaderProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onLoadById,
}) => {
  const [manualIdInput, setManualIdInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIdInput.trim()) {
      onLoadById(manualIdInput.trim());
      setManualIdInput('');
      setShowSearch(false);
    }
  };

  return (
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {accounts.length > 0 && (
            <select
              className="form-input"
              style={{
                padding: '0.4rem 0.75rem',
                width: 'auto',
                fontSize: '0.875rem',
                minWidth: '180px',
              }}
              value={selectedAccountId}
              onChange={(e) => onSelectAccount(e.target.value)}
            >
              <option value="" disabled>
                Select an Account
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.id.slice(-6)})
                </option>
              ))}
            </select>
          )}

          {showSearch ? (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem', width: '160px' }}
                placeholder="Paste Account ID..."
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Load
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowSearch(false)}
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowSearch(true)}
              title="Look up account directly by ID"
            >
              <Search size={14} />
              <span>Load by ID</span>
            </button>
          )}

          <div className="header-status">
            <span className="status-dot"></span>
            <span>API Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
