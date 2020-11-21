import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionRouter = Router();

const transactionsRepository = new TransactionsRepository();

transactionRouter.get('/', (request, response) => {
    // return a summary of all the transactions
    const transactions = transactionsRepository.all();
    // return a balance resulted from all transactions
    const balance = transactionsRepository.getBalance();

    return response.json({transactions, balance});
});

transactionRouter.post('/', (request, response) => {
  try {
    const { title, value, type } = request.body;

    // create a service to Create a transaction
    const createTransactionService = new CreateTransactionService(
      transactionsRepository,
    );

    // run the service
    const transaction = createTransactionService.execute({
      title,
      value,
      type,
    });

    return response.json(transaction);
  } catch (err) {
    // in case the user does not have enough balance
    return response.status(400).json({ error: err.message });
  }
});

export default transactionRouter;
