import { Schema, model, Types } from 'mongoose';

export interface AccountDocument {
  _id: Types.ObjectId;
  name: string;
  balance: number;
  createdAt: Date;
}

const accountSchema = new Schema<AccountDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const AccountModel = model<AccountDocument>('Account', accountSchema);
