import config from 'dos-config';
import { MongoClient, MongoClientOptions } from 'mongodb';

export enum Collections {
  Users = 'users',
  Tasks = 'tasks',
}

const opts: MongoClientOptions = {
  keepAlive: true,
};

const client = new MongoClient(config.mongo.url, opts);

let connection: MongoClient | undefined = undefined;

// This is not good, but it's good enough for the challenge...
export const getConnection = async (): Promise<MongoClient> => {
  if (connection instanceof MongoClient) return connection;
  const res = await client.connect();
  connection = res;
  return res;
}

export const getDb = async (dbName: string) => (await getConnection()).db(dbName);

export const initDb = async (dbName = config.mongo.db) => {
  const db = await getDb(dbName);
  await db.admin().ping();
  return db;
};
