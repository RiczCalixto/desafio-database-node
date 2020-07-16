// import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
