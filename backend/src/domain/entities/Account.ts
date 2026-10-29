
export interface AccountProps {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
}

export class Account {
  private constructor(
    private readonly props: AccountProps,
  ) {}

  // Create a new account with an initial balance of zero
  static create(name: string): Account {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error('Account name is required');
    }

    return new Account({
      id: '',
      name: normalizedName,
      balance: 0,
      createdAt: new Date(),
    });
  }

  // Create an account object from existing data
  static fromData(props: AccountProps): Account {
    return new Account(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get balance(): number {
    return this.props.balance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
