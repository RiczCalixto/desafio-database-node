// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import { CreateCategoryService } from './CreateCategoryService';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  public async execute({
    title,
    value,
    type,
    categoryName,
  }: TransactionDTO): Promise<Transaction> {
    const isOutcome = type === 'outcome';
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionBalance = await transactionsRepository.getBalance();
    const hasEnoughMoney = transactionBalance.total >= value;

    const isValidType = ['income', 'outcome'].includes(type);

    if (!isValidType) throw new AppError('Invalid type.');

    if (isOutcome && !hasEnoughMoney) throw new AppError('Not enough money.');
    // Não tratar como erro (exception) o que é regra de negócio.
    // Retornar um objeto para ser utilizado na camada de apresentação - ex: flash message.

    const category = await this.createCategoryService.execute({
      title: categoryName,
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
