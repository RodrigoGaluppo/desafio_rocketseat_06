import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transanctionRepository = getCustomRepository(TransactionsRepository);
    const transaction = await transanctionRepository.findOne(id);
    if (!transaction) {
      throw new AppError('transaction does noit exist');
    }
    await transanctionRepository.remove(transaction);
    // eslint-disable-next-line no-useless-return
    return;
  }
}

export default DeleteTransactionService;
