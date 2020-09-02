const { resolve } = require('path');

const rootDir = resolve(__dirname);

module.exports = {
  rootDir,
  displayName: 'root-tests',
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: 'coverage/unit',
  coveragePathIgnorePatterns: [
    '\\\\node_modules\\\\',
    'src/index.ts',
    '__tests__',
    'src/@types',
    'src/interfaces',
    'src/api.schema.json'
  ],
  coverageProvider: 'v8',
  preset: 'ts-jest',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'Weather API',
        publicPath: './html-report',
        filename: 'unit.html',
        expand: true,
      },
    ],
  ],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@tests/(.*)': '<rootDir>/__tests__/$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['\\\\node_modules\\\\'],
};
