import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import TransactionRepository from '../repositories/TransactionsRepository';

// object data parsed from a csv line
interface CSVTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}

class CreateTransactionsFromCSVService {
  public async execute(filename: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    // get the path to file
    const csvFilePath = path.resolve(uploadConfig.directory, filename);

    // create a reading stream
    const readCSVStream = fs.createReadStream(csvFilePath);

    // create the output stream that will start from line 2 (skip the headers)
    // and it'll remove left and right spaces from 'bla, bla, bla' => 'bla,bla,bla'
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    // create a communication (pipe) between the two streams
    const parseCommunication = readCSVStream.pipe(parseStream);

    // for bulk saving (saving all transactions at one time), we need to cache all transactions and categories from CSV
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCommunication.on('data', async (line: string[]) => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value: Number(value), category });
    });

    // wait until we finish reading all the file...
    await new Promise(resolve => parseCommunication.on('end', resolve));

    // returns all categories that are BOTH in the database AND in the array (cross-search)
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // we're only interested in the categories titles, not the whole category object
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // return the categories that are NOT in the database
    const categoriesToAdd = categories
      .filter(c => !existentCategoriesTitles.includes(c))
      // and remove the duplicates
      .filter((value, index, self) => {
        return index === self.indexOf(value);
      });

    const newCategories = categoriesRepository.create(
      // maps the string to a new object that contains title
      categoriesToAdd.map(title => ({
        title,
      })),
    );

    // save all categories into the database
    await categoriesRepository.save(newCategories);

    // finalCategories = newCategories (that were not in the database) + existentCategories (that were in the database already)
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(t => ({
        title: t.title,
        type: t.type,
        value: t.value,
        category: finalCategories.find(c => t.category === c.title),
      })),
    );

    // save transactions into database
    await transactionsRepository.save(createdTransactions);

    // delete file from temp folder
    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default CreateTransactionsFromCSVService;
