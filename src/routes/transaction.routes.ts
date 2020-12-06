import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionRouter = Router();

transactionRouter.get('/', async (request, response) => {
  // get our custom reposiotry of Transactions
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  // return a summary of all the transactions
  const transactions = await transactionsRepository.find({});
  // return a balance resulted from all transactions
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, categoryName } = request.body;

    // create a service to Create a Transaction
    const createTransactionService = new CreateTransactionService();

    // run the service
    const transaction = await createTransactionService.execute({
      title,
      value,
      type,
      categoryName,
    });

    return response.json(transaction);
  } catch (err) {
    // in case the user does not have enough balance
    return response.status(400).json({ error: err.message });
  }
});

export default transactionRouter;
