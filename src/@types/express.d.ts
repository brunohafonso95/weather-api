import { IDecodedUser } from './../services/AuthService';
import * as http from 'http';

declare module 'express-serve-static-core' {
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: IDecodedUser;
  }
}
