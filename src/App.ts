import './util/module-alias';
import { Server } from '@overnightjs/core';
import { json, Application } from 'express';

import ForecastController from './controllers/ForecastController';

export default class App extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init(): App {
    this.globalMiddlewares();
    this.setupControllers();
    return this;
  }

  public getApp(): Application {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }

  private globalMiddlewares(): App {
    this.app.use(json());
    return this;
  }

  private setupControllers(): App {
    const forecastController = new ForecastController();
    this.addControllers([forecastController]);
    return this;
  }
}
