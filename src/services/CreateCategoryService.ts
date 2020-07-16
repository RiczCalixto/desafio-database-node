import { getRepository, Repository } from 'typeorm';
import Category from '../models/Category';

interface CategoryDTO {
  title: string;
}

export class CreateCategoryService {
  public async execute({ title }: CategoryDTO): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const category = await categoryRepository.findOne({ where: { title } });

    return category
      ? category
      : this.createNewCategory(title, categoryRepository);
  }

  private async createNewCategory(
    title: string,
    categoryRepository: Repository<Category>,
  ): Promise<Category> {
    const newCategory = categoryRepository.create({ title });
    await categoryRepository.save(newCategory);

    return newCategory;
  }
}
