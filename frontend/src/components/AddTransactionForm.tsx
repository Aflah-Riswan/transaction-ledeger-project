import { useState, type FC } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Sparkles } from 'lucide-react';
import type { TransactionType } from '../types';

interface AddTransactionFormProps {
  selectedAccountId: string;
  onAddTransaction: (data: {
    type: TransactionType;
    amount: number;
    referenceId: string;
    description?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  onError: (message: string) => void;
}

export const AddTransactionForm: FC<AddTransactionFormProps> = ({
  selectedAccountId,
  onAddTransaction,
  isSubmitting,
  onError,
}) => {
  const [type, setType] = useState<TransactionType>('credit');
  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');

  const generateReferenceId = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setReferenceId(`REF-${Date.now().toString().slice(-6)}-${randomHex}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId) {
      onError('Please select an account first.');
      return;
    }

    const trimmedAmount = amount.trim();

    // Reject numbers starting with 0 or having leading zeros (e.g. "099", "0")
    if (!/^[1-9]\d*$/.test(trimmedAmount)) {
      onError('Please enter a valid number (cannot start with 0 or have leading zeros).');
      return;
    }

    const amountNum = Number(trimmedAmount);
    if (!Number.isSafeInteger(amountNum) || amountNum <= 0) {
      onError('Amount must be a positive integer greater than zero.');
      return;
    }

    if (!referenceId.trim()) {
      onError('Reference ID is required.');
      return;
    }

    await onAddTransaction({
      type,
      amount: amountNum,
      referenceId: referenceId.trim(),
      description: description.trim() || undefined,
    });

    // Reset inputs on success
    setAmount('');
    setReferenceId('');
    setDescription('');
  };

  return (
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
          <form onSubmit={handleSubmit}>
            {/* Credit / Debit Buttons */}
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${type === 'credit' ? 'active-credit' : ''}`}
                onClick={() => setType('credit')}
              >
                <ArrowDownLeft size={18} />
                <span>Credit (Deposit)</span>
              </button>
              <button
                type="button"
                className={`type-btn ${type === 'debit' ? 'active-debit' : ''}`}
                onClick={() => setType('debit')}
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
                type="text"
                inputMode="numeric"
                className="form-input"
                placeholder="e.g. 1000 (no leading zeros)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
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
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  disabled={isSubmitting}
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={isSubmitting || !amount || !referenceId.trim()}
            >
              {isSubmitting
                ? 'Processing...'
                : `Execute ${type === 'credit' ? 'Credit' : 'Debit'} Transaction`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
