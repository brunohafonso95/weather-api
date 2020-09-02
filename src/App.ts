import './util/module-alias';
import { Server } from '@overnightjs/core';
import cors from 'cors';
import { json, Application } from 'express';
import 'express-async-errors';
import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import expressPino from 'express-pino-logger';
import helmet from 'helmet';
import openapi from 'openapi-comment-parser';
import swaggerUI from 'swagger-ui-express';

import * as controllers from './controllers';
import * as database from './database';
import Logger from './Logger';
import errorMiddleware from './middlewares/errorMiddleware';
import openapiConfig from './openapirc';

const apiSchema = openapi(openapiConfig);
export default class App extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<App> {
    this.globalMiddlewares();
    await this.docsSetup();
    this.setupControllers();
    this.setupErrorMiddleware();
    await this.databaseSetup();
    return this;
  }

  public getApp(): Application {
    return this.app;
  }

  private setupErrorMiddleware(): void {
    this.app.use(errorMiddleware);
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

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(apiSchema));
    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: true,
    }).install(this.app);
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
