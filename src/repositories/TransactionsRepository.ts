/**
 * Custom Repository for Transactions. Needed because of the custom method getBalance()
 */

import { Repository, EntityRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionWithoutCategoryId {
  id: string;
  title: string;
  value: number;
  type: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    // reduce the transactions into a balance object
    const { income, outcome } = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += transaction.value;
            break;
          case 'outcome':
            accumulator.outcome += transaction.value;
            break;
          default:
            break;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;
    return {
      total,
      income,
      outcome,
    };
  }

  public async all(): Promise<TransactionWithoutCategoryId[]> {
    const transactions = await this.find();
    const transactionsWithoutCategoryId = [] as TransactionWithoutCategoryId[];

    transactions.forEach(transaction => {
      transactionsWithoutCategoryId.push({
        id: transaction.id,
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      });
    });

    return transactionsWithoutCategoryId;
  }
}

export default TransactionsRepository;
