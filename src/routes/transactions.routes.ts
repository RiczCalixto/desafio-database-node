import { Router } from 'express';
import CreateTransactionService from '../services/CreateTransactionService';
import { CreateCategoryService } from '../services/CreateCategoryService';
import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';

// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.all();

  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createCategoryService = new CreateCategoryService();
  const createTransactionService = new CreateTransactionService(
    createCategoryService,
  );
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  return response.status(204).json({});
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
