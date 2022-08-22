import { decode } from 'jsonwebtoken';
import request from 'supertest';

import { db, url } from '../setup';
import { Collections } from '../../../db';
import { createUserAndLogin, getError } from '../utils';
import hash from '../../../helpers/hash';

export const mutations = {
  createUser: `mutation createUser($email: String!, $password: String!) {
    createUser(email: $email, password: $password) {
      email,
    }
  }`,
  login: `mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }`,
};

describe('users', () => {
  const variables = { email: 'test@test.com', password: '123' };

  afterEach(async () => {
    await db.collection(Collections.Users).deleteMany({});
  });

  it('should create user', async () => {
    const mutationCreateUser = { query: mutations.createUser, variables };
    const response = await request(url).post('/').send(mutationCreateUser);
    const { email } = response.body.data.createUser;
    const user = await db.collection(Collections.Users).findOne({ email }, {
      projection: { _id: 0 },
    });

    const error = getError(response);
    expect(error).toBeUndefined();
    expect(email).toBe('test@test.com');
    expect(user).toEqual({
      email,
      password: hash(variables.password, variables.email),
    })
  });

  it('should login', async () => {
    const response = await createUserAndLogin(url, variables);
    const jwt = response.body.data.login;

    const error = getError(response);
    expect(error).toBeUndefined();
    expect(decode(jwt)).toEqual({
      email: 'test@test.com',
      iat: expect.any(Number),
      exp: expect.any(Number),
      session: expect.any(String),
    });
  });

  it('should error when creating user with duplicated email', async () => {
    const mutationCreateUser = { query: mutations.createUser, variables };
    await request(url).post('/').send(mutationCreateUser);
    const response = await request(url).post('/').send(mutationCreateUser);
    const { email } = variables;
    const users = await db.collection(Collections.Users).find({ email }, {
      projection: { _id: 0 },
    }).toArray();

    const error = getError(response);
    expect(error.message).toBe('DUPLICATED_EMAIL');
    expect(users.length).toBe(1);
  });

  it('should error with "INVALID_CREDENTIALS"', async () => {
    const mutationLogin = { query: mutations.login, variables };
    const response = await request(url).post('/').send(mutationLogin);

    const error = getError(response);
    expect(error.message).toBe('INVALID_CREDENTIALS');
    expect(response.body.data).toBe(null);
  });

  it('should error with "SESSION_STILL_VALID"', async () => {
    const mutationCreateUser = { query: mutations.createUser, variables };
    const mutationLogin = { query: mutations.login, variables };
    await request(url).post('/').send(mutationCreateUser);
    const jwt = (await request(url).post('/').send(mutationLogin)).body.data.login;

    const response = await request(url)
      .post('/')
      .set('Authorization', `Bearer ${jwt}`)
      .send(mutationLogin);

    const error = getError(response);
    expect(error.message).toBe('SESSION_STILL_VALID');
    expect(response.body.data).toBe(null);
  });
});
