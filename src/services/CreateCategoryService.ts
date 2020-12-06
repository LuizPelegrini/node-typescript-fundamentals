import { getRepository, FindOperator } from 'typeorm';

import Category from '../models/Category';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    // attempt to fetch an existing category with the same name
    let category = await categoriesRepository.findOne({
      where: { title: new FindOperator('ilike', title) }, // title query is case insensitive
    });

    // if no category could be found, create one
    if (!category) {
      category = categoriesRepository.create({ title });
      await categoriesRepository.save(category);
    }

    return category;
  }
}

export default CreateCategoryService;
