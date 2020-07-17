import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface ListTransactions {
  transactions: Transaction[];
  balance: Balance;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<ListTransactions> {
    const transactions = await this.find();
    const balance = await this.getBalance();

    return { transactions, balance };
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const { income, outcome } = transactions.reduce(
      (accumulator: Omit<Balance, 'total'>, transaction: Transaction) => {
        const transactionType = {
          income: () => (accumulator.income += Number(transaction.value)),
          outcome: () => (accumulator.outcome += Number(transaction.value)),
        };
        transactionType[transaction.type]();
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
      },
    );
    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
