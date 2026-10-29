import { useState, type FC } from 'react';
import { PlusCircle } from 'lucide-react';

interface CreateAccountFormProps {
  onCreateAccount: (name: string) => Promise<void>;
  isCreating: boolean;
}

export const CreateAccountForm: FC<CreateAccountFormProps> = ({
  onCreateAccount,
  isCreating,
}) => {
  const [accountName, setAccountName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    await onCreateAccount(accountName.trim());
    setAccountName('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <PlusCircle size={20} color="#2563eb" />
          <span>Create Account</span>
        </h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="accountName">
              Account Holder Name
            </label>
            <input
              id="accountName"
              type="text"
              className="form-input"
              placeholder="e.g. Savings Ledger, Alice Doe"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              disabled={isCreating}
            />
            <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
              Initial balance is strictly initialized to 0. Unique ID generated automatically.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isCreating || !accountName.trim()}
          >
            {isCreating ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
