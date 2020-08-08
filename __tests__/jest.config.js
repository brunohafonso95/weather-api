const { resolve } = require('path');

const rootDir = resolve(__dirname, '..');
const rootConfig = require(`${rootDir}/jest.config.js`);

module.exports = {
  ...rootConfig,
  rootDir,
  displayName: 'e2e-tests',
  setupFilesAfterEnv: ["<rootDir>/__tests__/jest-setup.ts"],
  testMatch: ["<rootDir>/__tests__/**/*.spec.ts"]
};
