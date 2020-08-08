const { resolve } = require('path');

const rootDir = resolve(__dirname);

module.exports = {
  rootDir,
  displayName: "root-tests",
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['\\\\node_modules\\\\'],
  coverageProvider: 'v8',
  preset: 'ts-jest',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        pageTitle: 'Weather API',
        publicPath: './html-report',
        filename: 'report.html',
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
