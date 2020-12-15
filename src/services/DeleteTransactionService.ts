import { validate } from 'uuid';
import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import AppError from '../error/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // first, verify if the id is a uuid
    if (!validate(id)) {
      throw new AppError('ID is not valid');
    }

    const transactionRepository = getCustomRepository(TransactionRepository);
    // find the transaction to delete by its id
    const transactionToDelete = await transactionRepository.findOne({
      where: { id },
    });

    // if transaction could not be found, throw error
    if (!transactionToDelete) {
      throw new AppError('ID does not exist', 404);
    }

    // otherwise, delete it and return as result
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
