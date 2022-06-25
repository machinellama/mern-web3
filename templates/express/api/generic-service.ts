import { Filter, ObjectId } from 'mongodb';
import { connect } from '../util/mongo';

/**
 * Generic Service defining get and create functions for a given generic type
 * Note: any type used must have 'id' property
 */
export default class GenericService<T> {
  /*
   * If id is present, return a specific item.
   * Else, return multiple items
   *
   * Return an array of T items
   */
  public async genericGet(
    collectionName: string,
    params?: {
      id?: number | string,
      limit?: number,
      offset?: number,
      userId?: number | string
    },
    query?: object
  ): Promise<T | T[]> {
    const database = await connect('test');
    const collection = await database.collection<T>(collectionName);

    if (params.id != null) {
      const collectionQuery: Filter<any> = {
        _id: new ObjectId(params.id)
      };

      return collection.findOne<T>(collectionQuery);
    } else {
      let collectionQuery = {} as any;

      if (query != null) {
        collectionQuery = { ...query };
      }
      if (params.limit != null) {
        collectionQuery.$limit = params.limit;
      }
      if (params.offset != null) {
        collectionQuery.$skip = params.offset;
      }

      // only return items that belong to a user
      if (params.userId != null) {
        collectionQuery.userId = params.userId;
      }

      // copy _id to id for all items
      const items = await collection.find<T>(collectionQuery).toArray();
      return items.map(item => {
        item['id'] = item['_id'];
        return item;
      });
    }
  }
}
