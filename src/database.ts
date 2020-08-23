import config from 'config';
import mongoose, { Mongoose } from 'mongoose';

import IDatabaseConfig from './interfaces/IDatabaseConfig';

const dbConfig: IDatabaseConfig = config.get('App.database');

export const connect = async (): Promise<Mongoose> =>
  mongoose.connect(dbConfig.mongoUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

export const close = async (): Promise<void> => mongoose.connection.close();
