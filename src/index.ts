import server from './server';
import { initDb } from './db';

const initApp = async () => {
  try {
    const db = await initDb();
    const { url } = await server(db);
    console.log(`🚀 Server ready at ${url}`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initApp();
