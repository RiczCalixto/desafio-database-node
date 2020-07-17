import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
import { CreateCategoryService } from '../services/CreateCategoryService';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';
import multer from 'multer';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.all();

  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category: categoryName } = request.body;
  const createCategoryService = new CreateCategoryService();
  const createTransactionService = new CreateTransactionService(
    createCategoryService,
  );
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    categoryName,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).json({});
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const csvTransactions = await importTransactionsService.execute(
      request.file.path,
    );

    return response.json(csvTransactions);
  },
);

export default transactionsRouter;
