import { Body, Get, Post, Query, Request, Route } from 'tsoa';

import { Transaction } from './transaction';
import { validateJWT } from '../../util/auth';
import TransactionsService from './transactions.service';

/**
 * Transactions controller
 */
@Route('api/transactions')
export class TransactionsController {
  @Get('')
  public async getTransactions(
    @Request() request,
    @Query() id?: number | string,
    @Query() limit?: number,
    @Query() offset?: number
  ): Promise<Transaction | Transaction[]> {
    const user = validateJWT(request);

    const service = new TransactionsService();

    return await service.genericGet('transactions', { id, limit, offset, userId: user['_id'] });
  }

  @Post('')
  public async saveTransaction(@Request() request, @Body() transaction: Transaction): Promise<void> {
    const user = validateJWT(request);

    const service = new TransactionsService();

    return await service.saveTransaction(request, { ...transaction, userId: user['_id'] });
  }
}
