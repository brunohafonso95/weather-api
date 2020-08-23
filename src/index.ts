import config from 'config';

import App from './App';
import IApplicationConfig from './interfaces/IAplicationConfig';

const applicationConfig: IApplicationConfig = config.get('App');

(async () => {
  const app = new App(applicationConfig.port);
  await app.init();
  app.start();
})();
