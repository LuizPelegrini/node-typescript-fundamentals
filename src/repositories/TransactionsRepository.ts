import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Summary {
  transactions: Transaction[];
  balance: Balance;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    // if no transactions has been made, return an "empty" balance
    if (this.transactions.length === 0) return balance;

    // initialize the first values for income/outcome
    if (this.transactions[0].type === 'income')
      balance.income = this.transactions[0].value;
    else balance.outcome = this.transactions[0].value;

    // reduce the array
    this.transactions.reduce((previousValue, currentValue) => {
      if (currentValue.type === 'income') {
        balance.income += currentValue.value;
        return {
          ...currentValue,
        };
      }

      balance.outcome += currentValue.value;
      return {
        ...currentValue,
      };
    });

    balance.total = balance.income - balance.outcome;

    return balance;
  }

  public summary(): Summary {
    const summary: Summary = {
      transactions: this.transactions,
      balance: this.getBalance(),
    };

    return summary;
  }

  public create({ title, value, type }: TransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });
    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
