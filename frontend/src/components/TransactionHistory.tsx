import { History, RefreshCw, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '../types';

interface TransactionHistoryProps {
  selectedAccountId: string;
  transactions: Transaction[];
  filter: 'all' | 'credit' | 'debit';
  onFilterChange: (filter: 'all' | 'credit' | 'debit') => void;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  selectedAccountId,
  transactions,
  filter,
  onFilterChange,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  isLoading,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <History size={20} color="#2563eb" />
          <span>Transaction History</span>
        </h2>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'credit' ? 'active' : ''}`}
            onClick={() => onFilterChange('credit')}
          >
            Credit
          </button>
          <button
            className={`filter-tab ${filter === 'debit' ? 'active' : ''}`}
            onClick={() => onFilterChange('debit')}
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
        ) : isLoading ? (
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
                      className={`badge ${
                        tx.type === 'credit' ? 'badge-credit' : 'badge-debit'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft size={12} />
                      ) : (
                        <ArrowUpRight size={12} />
                      )}
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`amount-cell ${
                      tx.type === 'credit' ? 'amount-credit' : 'amount-debit'
                    }`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {tx.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className="mono-text">
                      {tx.reference_id || tx.referenceId}
                    </span>
                  </td>
                  <td>
                    {tx.description || <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                  <td className="mono-text">
                    {new Date(
                      tx.created_at || tx.createdAt || '',
                    ).toLocaleString()}
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
            Showing page <strong>{currentPage}</strong> of{' '}
            <strong>{totalPages}</strong> ({totalRecords} records)
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              Previous
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
