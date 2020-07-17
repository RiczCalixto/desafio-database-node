import fs from 'fs';
import csvParse from 'csv-parse';
import { In, getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface ParsedItems {
  transactions: CSVTransaction[];
  categories: string[];
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { transactions, categories } = await this.parseCsv(filePath);
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const newCategoryTitles = categories
      .filter(category => !existentTitles.includes(category))
      .filter(
        (category, index, categories) => categories.indexOf(category) === index,
      );

    const createNewCategories = categoriesRepository.create(
      newCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(createNewCategories);

    const finalCategories = [...createNewCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }

  private async parseCsv(filePath: string): Promise<ParsedItems> {
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];
    const contactsReadStream = fs.createReadStream(filePath);
    const parseStream = csvParse({ from_line: 2, ltrim: true, rtrim: true });
    const parseCSV = contactsReadStream.pipe(parseStream);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    return { transactions, categories };
  }
}

export default ImportTransactionsService;
