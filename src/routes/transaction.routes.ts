import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';

const transactionRouter = Router();

const transactionsRepository = new TransactionsRepository();

transactionRouter.get('/', (request, response) => {
  try {
    // return a summary of all the transaction
    return response.json(transactionsRepository.summary());
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
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
