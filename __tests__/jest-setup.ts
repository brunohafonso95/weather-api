import superTest from 'supertest';

import App from '@src/App';

let app: App;

beforeAll(async () => {
  app = new App();
  await app.init();
  global.testRequest = superTest(app.getApp());
});

afterAll(async () => {
  await app.closeApplication();
});
