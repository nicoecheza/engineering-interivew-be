import config from 'dos-config';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

interface Claims {
  session: string;
  email: string;
}

export const parseHeader = (authHeader?: string) => {
  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    return authHeader.split(' ')[1];
  }
}

export const getToken = (authHeader?: string) => {
  try {
    const token = parseHeader(authHeader);
    return jwt.verify(token || '', config.jwt.secret)
  } catch (_) {
    return null;
  }
};

export const createToken = (claims: Claims) => (
  jwt.sign(claims, config.jwt.secret, { expiresIn: config.jwt.expiration })
);

export const createUserToken = (email: string) => {
  const session = uuid();
  const claims = { session, email };

  return createToken(claims);
};
