import { Db } from 'mongodb';

import { Collections } from '../db';
import Users from './users';
import Tasks from './tasks';

export type DataSources = ReturnType<typeof ds>;

const ds = (db: Db) => ({
  users: new Users(db.collection(Collections.Users)),
  tasks: new Tasks(db.collection(Collections.Tasks)),
});

export default ds;
