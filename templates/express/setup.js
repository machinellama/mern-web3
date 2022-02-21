const { MongoClient } = require('mongodb');
const config = require('../config');

const list = [
  {
    id: 1,
    name: 'Marceline Abadeer',
    location: 'Cave, Ooo',
    description: 'I eat the color red sometimes',
    created: new Date()
  },
  {
    id: 2,
    name: 'Princess Bubblegum',
    location: 'Candy Kingdom, Ooo',
    description: 'Good, I\'ve always loved your songs',
    created: new Date()
  },
  {
    id: 3,
    name: 'Flame Princess',
    location: 'Flame Kingdom, Ooo',
    created: new Date()
  }
];

async function start() {
  const mongoURL = `${config.mongo.url}:${config.mongo.port}`;
  const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
  await client.connect();

  const database = await client.db('test');
  const collection = await database.collection('characters');
  
  list.forEach(async p => {
    await collection.updateOne({ _id: p.id }, { $set: p }, { upsert: true });
  });

  process.exit(0);
}

start();
