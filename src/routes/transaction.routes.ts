import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import CreateTransactionsFromCSVService from '../services/CreateTransactionsFromCSVService';

import uploadConfig from '../config/upload';

const transactionRouter = Router();
const upload = multer(uploadConfig);

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
  const { title, value, type, category } = request.body;

  // create a category service that POSSIBLY create a new category or return an existing one
  const createCategoryService = new CreateCategoryService();
  const newCategory = await createCategoryService.execute(category);

  // create a service to Create a Transaction
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category: newCategory,
  });

  // remove categoryId from object
  const transactionWithoutCategoryId = {
    id: transaction.id,
    title: transaction.title,
    value: transaction.value,
    type: transaction.type,
    category: transaction.category,
  };

  return response.json(transactionWithoutCategoryId);
});

// REMOVE a given transaction based on its id
transactionRouter.delete('/:id', async (request, response) => {
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
});

// LOAD transactions from a CSV file
transactionRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // create a service to create transactions from the uploaded csv file
    const createTransactionsFromCSV = new CreateTransactionsFromCSVService();
    const transactions = await createTransactionsFromCSV.execute(
      request.file.filename,
    );

    return response.json(transactions);
  },
);

export default transactionRouter;
