import bcrypt from 'bcrypt';
import config from 'config';
import jwt from 'jsonwebtoken';

import IAuthConfig from '@src/interfaces/IAuthConfig';
import { User } from '@src/models/User';

const authConfig: IAuthConfig = config.get('App.auth');

export interface IDecodedUser extends Omit<User, '_id'> {
  id: string;
}

export default class AuthService {
  public static async hashPassword(
    password: string,
    salt = 10,
  ): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  public static async compareHash(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  public static generateToken(payload: {
    [key: string]: string | boolean | number;
  }): string {
    const token = jwt.sign(payload, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    return token;
  }

  public static decodeToken(token: string): IDecodedUser {
    return jwt.verify(token, authConfig.secret) as IDecodedUser;
  }
}
