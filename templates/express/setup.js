const { MongoClient } = require('mongodb');
const config = require('../config');

const list = [
  {
    name: 'Marceline Abadeer',
    location: 'Cave, Ooo',
    description: 'I eat the color red sometimes',
    created: new Date().toISOString()
  },
  {
    name: 'Princess Bubblegum',
    location: 'Candy Kingdom, Ooo',
    description: 'Good, I\'ve always loved your songs',
    created: new Date().toISOString()
  },
  {
    name: 'Flame Princess',
    location: 'Flame Kingdom, Ooo',
    created: new Date().toISOString()
  }
];

async function start() {
  const mongoURL = `${config.mongo.url}:${config.mongo.port}`;
  const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
  await client.connect();

  const database = await client.db(config.mongo.databaseName);
  const collection = await database.collection('characters');
  
  await collection.insertMany(list);

  process.exit(0);
}

start();
