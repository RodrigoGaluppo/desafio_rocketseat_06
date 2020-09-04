import { getCustomRepository, getRepository, In, TransactionRepository} from "typeorm"
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from "../models/Category";

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const contactRoadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCsv = contactRoadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });
      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCsv.on('end', resolve));

    const exists = await categoriesRepository.find({
      where: {
        type: In(categories),
      },
    });

    const CategoriesTitles = exists.map(() => (category: Category) =>
      category.title,
    );
    const addCategoryTitles = categories.filter(
      category => !CategoriesTitles.includes(category),
    );
  }
}

export default ImportTransactionsService;
