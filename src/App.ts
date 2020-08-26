import './util/module-alias';
import { Server } from '@overnightjs/core';
import cors from 'cors';
import { json, Application } from 'express';
import expressPino from 'express-pino-logger';
import helmet from 'helmet';

import * as controllers from './controllers';
import * as database from './database';
import Logger from './Logger';

export default class App extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<App> {
    this.globalMiddlewares();
    this.setupControllers();
    await this.databaseSetup();
    return this;
  }

  public getApp(): Application {
    return this.app;
  }

  private globalMiddlewares(): App {
    this.app.use(json());
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(
      expressPino({
        logger: Logger,
      }),
    );
    return this;
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  public async closeApplication(): Promise<void> {
    await database.close();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      Logger.info(`server listening on port ${this.port}`);
    });
  }

  private setupControllers(): App {
    this.addControllers([
      ...Object.values(controllers).map(Controller => new Controller()),
    ]);

    return this;
  }
}
