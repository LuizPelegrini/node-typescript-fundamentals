import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
      const balance = await this.transactionsRepository.getBalance();
      if (balance.total < value) {
        throw Error(`You do not have enough balance ${title}`);
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
