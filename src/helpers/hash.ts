import crypto from 'crypto';
import config from 'dos-config';

export default (password: string, salt: string): string => crypto
  .createHmac('sha512', config.passwordSalt)
  .update(`${password}${salt}`)
  .digest('hex');
