import { ServerInfo } from 'apollo-server';
import { Db } from 'mongodb';

import createServer from '../../server';
import { getConnection, initDb } from '../../db';
import { getTestingDb } from './utils';

export let server: ServerInfo['server']
export let url: ServerInfo['url'];
export let db: Db;

beforeAll(async () => {
  db = await initDb(getTestingDb());
  ({ server, url } = await createServer(db));
});

afterAll(async () => {
  server.close();
  await db.dropDatabase();
  (await getConnection()).close();
});
