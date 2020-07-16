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
  category: string;
}

class CreateTransactionService {
  constructor(private readonly createCategoryService: CreateCategoryService) {}

  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const isOutcome = type === 'outcome';
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactionBalance = await transactionsRepository.getBalance();
    const hasEnoughMoney = transactionBalance.total >= value;

    const isValidType = ['income', 'outcome'].includes(type);

    if (!isValidType) throw new AppError('Invalid type.');

    if (isOutcome && !hasEnoughMoney) throw new AppError('Not enough money.');

    const { id } = await this.createCategoryService.execute({
      title: category,
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
