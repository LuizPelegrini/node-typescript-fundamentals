import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../error/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: Category;
}

class CreateTransactionService {
  // get our custom repository for Transactions
  private transactionsRepository = getCustomRepository(TransactionsRepository);

  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // User can't create a transaction if he does not have enough balance
    if (type === 'outcome') {
      const { total } = await this.transactionsRepository.getBalance();
      if (total < value) {
        throw new AppError('You do not have enough balance');
      }
    }

    // create a transaction object in the repository
    const transaction = this.transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    // save the created transaction in the database
    await this.transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
