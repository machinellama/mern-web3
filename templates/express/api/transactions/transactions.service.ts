import { Request as ExRequest } from 'express';

import { connect } from '../../util/mongo';
import { Transaction } from './transaction';
import GenericService from '../generic-service';
import config from '../../../config';

/**
 * Transactions Service for transactions data
 */
export default class TransactionsService extends GenericService<Transaction> {
  /**
   * Save an ETH transfer transaction for a User
    */
  public async saveTransaction(req: ExRequest, transaction: Transaction): Promise<void> {
    const database = await connect(config.mongo.databaseName);
    const collection = await database.collection<Transaction>('transactions');

    await collection.insertOne(transaction);
  }
}
