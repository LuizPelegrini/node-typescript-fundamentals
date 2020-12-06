import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';

const transactionRouter = Router();

// LIST all transactions and show the resulting balance
transactionRouter.get('/', async (request, response) => {
  // get our custom reposiotry of Transactions
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  // return a summary of all the transactions.
  // the all() method removes categoryId from the transactions array
  const transactions = await transactionsRepository.all();
  // return a balance resulted from all transactions
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

// CREATE a new transaction
transactionRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, categoryName } = request.body;

    // create a category service that POSSIBLY create a new category or return an existing one
    const createCategoryService = new CreateCategoryService();
    const category = await createCategoryService.execute(categoryName);

    // create a service to Create a Transaction
    const createTransactionService = new CreateTransactionService();
    const transaction = await createTransactionService.execute({
      title,
      value,
      type,
      category,
    });

    // remove categoryId from object
    const transactionWithoutCategoryId = {
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: transaction.category,
    };

    return response.json(transactionWithoutCategoryId);
  } catch (err) {
    // in case the user does not have enough balance
    return response.status(400).json({ error: err.message });
  }
});

transactionRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    // create a service to delete a transaction with the given id
    const deleteService = new DeleteTransactionService();
    const transactionDeleted = await deleteService.execute(id);

    // remove categoryId from object
    const transactionWithoutCategoryId = {
      title: transactionDeleted.title,
      value: transactionDeleted.value,
      type: transactionDeleted.type,
      category: transactionDeleted.category,
    };

    return response.json(transactionWithoutCategoryId);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default transactionRouter;
