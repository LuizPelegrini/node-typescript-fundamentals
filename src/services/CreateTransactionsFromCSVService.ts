import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import CreateCategoryService from './CreateCategoryService';
import CreateTransactionService from './CreateTransactionService';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

// object data parsed from a csv line
interface TransactionCSVLine {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionsFromCSVService {
  public async execute(filename: string): Promise<Transaction[]> {
    // get the path to file
    const csvFilePath = path.resolve(uploadConfig.directory, filename);

    // load csv data
    const lines = await this.loadCSV(csvFilePath);
    // immediatelly remove the file from local storage
    await fs.promises.unlink(csvFilePath);
    // return all the transactions loaded from CSV and saved to the database
    const transactions = await this.createTransactions(lines);

    return transactions;
  }

  // load an array of lines from csv files
  private async loadCSV(csvPath: string): Promise<string[][]> {
    // create a reading stream
    const readCSVStream = fs.createReadStream(csvPath);

    // create the output stream that will start from line 2 (skip the headers)
    // and it'll remove left and right spaces from 'bla, bla, bla' => 'bla,bla,bla'
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    // create a communication (pipe) between the two streams
    const parseCommunication = readCSVStream.pipe(parseStream);

    const lines = [] as string[][];
    // Read line-by-line
    parseCommunication.on('data', line => {
      lines.push(line);
    });

    // hangs the function until the file is completely read
    await new Promise(resolve => {
      parseCommunication.on('end', resolve);
    });

    return lines;
  }

  // save multiple transactions to database given an array of csv lines
  private async createTransactions(lines: string[][]): Promise<Transaction[]> {
    const transactions = [] as Transaction[];
    // create a cache of categories to avoid fetching DB
    const categories = [] as Category[];
    const createCategory = new CreateCategoryService();
    const createTransaction = new CreateTransactionService();

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      // retrieve values from line
      const { title, value, type, categoryName } = this.parseLine(line);

      // attempt to find a category in the memory first
      // if not found, then we try in database
      let category = categories.find(c => c.title === categoryName);
      if (!category) {
        category = await createCategory.execute(categoryName);
        categories.push(category);
      }

      // create a new transaction in the database
      const newTransaction = await createTransaction.execute({
        title,
        value,
        type,
        category,
      });

      transactions.push(newTransaction);
    }

    return transactions;
  }

  // from a ['title', 'type', '1500', 'categoryName'] returns an object
  private parseLine(line: string[]): TransactionCSVLine {
    return {
      title: line[0],
      // FIXME: throw error if type is not neither 'income' or 'outcome'
      type: line[1] === 'income' ? 'income' : 'outcome',
      value: parseFloat(line[2]),
      categoryName: line[3],
    };
  }
}

export default CreateTransactionsFromCSVService;
