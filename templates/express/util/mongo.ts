import { MongoClient, Db } from 'mongodb';

import config from '../../config';

let connections = {}

// Connect to mongo and return a db object of the given database
export async function connect(database: string): Promise<Db> {
  if (connections[database]) {
    return connections[database];
  } else {
    const mongoURL = `${config.mongo.url}:${config.mongo.port}`;
    const client = new MongoClient(mongoURL);

    await client.connect();

    connections[database] = client.db(database);

    return connections[database];
  }
}
