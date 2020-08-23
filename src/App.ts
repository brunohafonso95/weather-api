import './util/module-alias';
import { Server } from '@overnightjs/core';
import { json, Application } from 'express';

import * as controllers from './controllers';
import * as database from './database';

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
      console.info(`server listening on port ${this.port}`);
    });
  }

  private setupControllers(): App {
    this.addControllers([
      ...Object.values(controllers).map(Controller => new Controller()),
    ]);

    return this;
  }
}
