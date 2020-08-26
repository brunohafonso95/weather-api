import config from 'config';

import App from './App';
import IApplicationConfig from './interfaces/IAplicationConfig';
import Logger from './Logger';

const applicationConfig: IApplicationConfig = config.get('App');

enum ExitedStatus {
  FAILURE = 1,
  SUCCESS = 0,
}

process.on('unhandledRejection', (reason, promise) => {
  Logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`,
  );

  throw reason;
});

process.on('uncaughtException', error => {
  Logger.error(`App exiting due to an unhandled exception: ${error}`);

  process.exit(ExitedStatus.FAILURE);
});

(async () => {
  try {
    const app = new App(applicationConfig.port);
    await app.init();
    app.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.forEach((signal: string) => {
      process.on(
        signal,
        async (): Promise<void> => {
          try {
            await app.closeApplication();
            Logger.info('App exited with success');
            process.exit(ExitedStatus.SUCCESS);
          } catch (error) {
            Logger.info('App exited with error');
            process.exit(ExitedStatus.FAILURE);
          }
        },
      );
    });
  } catch (error) {
    Logger.error(`App exited with error: ${error}`);
    process.exit(ExitedStatus.FAILURE);
  }
})();
