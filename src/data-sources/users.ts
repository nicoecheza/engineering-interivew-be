import { MongoDataSource } from 'apollo-datasource-mongodb';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { OptionalId, ObjectId } from 'mongodb';
import { validEmail } from '../helpers/email';

import hash from '../helpers/hash';
import { createUserToken } from '../helpers/jwt';

export interface User {
  _id: ObjectId;
  password: string;
  email: string;
}

export default class Users extends MongoDataSource<OptionalId<User>> {
  private getCurrentSession() {
    return this.context.session;
  }
  async login({ email, password }: { email: string, password: string }) {
    const session = this.getCurrentSession();

    if (session) {
      throw new ForbiddenError('SESSION_STILL_VALID');
    }

    const user = (await this.findByFields({ email }))[0];

    if (!user || hash(password, email) !== user.password) {
      throw new AuthenticationError('INVALID_CREDENTIALS');
    }

    return createUserToken(email);
  }
  async createUser(user: Omit<User, '_id'>) {
    const session = this.getCurrentSession();

    if (session) {
      throw new ForbiddenError('SESSION_STILL_VALID');
    }

    const userFound = (await this.findByFields({ email: user.email }))[0];

    // just to validate something and not feel bad...
    if (userFound || !validEmail(user.email) || user.password.length < 3) {
      throw new ForbiddenError('INVALID_CREDENTIALS');
    }

    await this.collection.insertOne({
      ...user,
      password: hash(user.password, user.email),
    });

    return user;
  }
}
