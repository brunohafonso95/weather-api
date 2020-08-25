import config from 'config';
import pino from 'pino';

import IApplicationConfig from '@src/interfaces/IAplicationConfig';
import ILoggerConfig from '@src/interfaces/ILoggerConfig';

const appConfig: IApplicationConfig = config.get('App');
const loggerConfig: ILoggerConfig = config.get('App.logger');

export default pino({
  enabled: loggerConfig.enabled,
  level: loggerConfig.level,
  prettyPrint: appConfig.env !== 'production',
});
