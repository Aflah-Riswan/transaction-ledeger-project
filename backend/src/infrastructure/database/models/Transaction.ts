import { Schema, model, Types } from 'mongoose';
import { TransactionType } from '../../../domain/entities/Transaction';

export interface TransactionDocument {
  _id: Types.ObjectId;
  accountId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string;
  createdAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>({
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    immutable: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
    immutable: true,
  },
  referenceId: {
    type: String,
    required: true,
    trim: true,
    immutable: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true,
  },
});

transactionSchema.index(
  { accountId: 1, referenceId: 1 },
  { unique: true },
);

transactionSchema.index({ accountId: 1, createdAt: -1, _id: -1 });

export const TransactionModel = model<TransactionDocument>(
  'Transaction',
  transactionSchema,
);
