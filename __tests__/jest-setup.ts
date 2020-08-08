import superTest from 'supertest';

import App from '@src/App';

beforeAll(() => {
  const app = new App().init().getApp();
  global.testRequest = superTest(app);
});
