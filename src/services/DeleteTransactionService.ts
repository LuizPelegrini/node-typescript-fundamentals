import { validate } from 'uuid';
import { getCustomRepository } from 'typeorm';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<Transaction> {
    // first, verify if the id is a uuid
    if (!validate(id)) {
      throw Error('ID is not valid');
    }

    const transactionRepository = getCustomRepository(TransactionRepository);
    // find the transaction to delete by its id
    const transactionToDelete = await transactionRepository.findOne({
      where: { id },
    });

    // if transaction could not be found, throw error
    if (!transactionToDelete) {
      throw Error('ID does not exist');
    }

    // otherwise, delete it and return as result
    await transactionRepository.delete(id);

    return transactionToDelete;
  }
}

export default DeleteTransactionService;
