import config from 'dos-config';
import request, { Response } from 'supertest';

import { User } from '../../data-sources/users';
import { mutations as userMutations } from './resolvers/users.test';

export const getTestingDb = () => `${config.mongo.db}-test`;
export const getError = (response: Response) => (response.body.errors || [])[0];
export const createUserAndLogin = async (
  url: string,
  variables: Omit<User, '_id'>,
) => {
  const mutationCreateUser = { query: userMutations.createUser, variables };
  const mutationLogin = { query: userMutations.login, variables };
  await request(url).post('/').send(mutationCreateUser);
  return request(url).post('/').send(mutationLogin);
}
