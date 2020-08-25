const assets = [
  { path: 'src/index.js', label: 'forecast beach weather api' },
];

const verifyConditions = [
  ['@semantic-release/changelog'],
  [
    '@semantic-release/git',
    {
      assets: ['package.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]',
    },
  ],
  [
    '@semantic-release/github',
    {
      assets,
    },
  ],
];

const analyzeCommits = [
  [
    '@semantic-release/commit-analyzer',
    {
      preset: 'angular',
      releaseRules: [
        { breaking: true, release: 'major' },
        { revert: true, release: 'patch' },
        { type: 'feat', release: 'minor' },
        { type: 'fix', release: 'patch' },
        { type: 'refactor', release: 'patch' },
        { type: 'style', release: 'patch' },
      ],
      parserOpts: {
        noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
      },
    },
  ],
];

const generateNotes = [
  [
    '@semantic-release/release-notes-generator',
    {
      preset: 'conventionalcommits',
      presetConfig: {
        types: [
          {
            type: 'feat',
            section: ':sparkles: New Features',
            hidden: false,
          },
          {
            type: 'fix',
            section: ':bug: Fixes',
            hidden: false,
          },
          {
            type: 'docs',
            section: ':memo: Documentation',
            hidden: false,
          },
          {
            type: 'style',
            section: ':barber: Style',
            hidden: false,
          },
          {
            type: 'refactor',
            section: ':zap: Refactor',
            hidden: false,
          },
          {
            type: 'perf',
            section: ':fast_forward: Performance',
            hidden: false,
          },
          {
            type: 'test',
            section: ':white_check_mark: Tests',
            hidden: false,
          },
          {
            type: 'ci',
            section: ':repeat: CI',
            hidden: false,
          },
          {
            type: 'improment',
            section: ':muscle: Improvement',
            hidden: false,
          },
          {
            type: 'chore',
            hidden: true,
          },
        ],
      },
      parserOpts: {
        noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES', 'BREAKING'],
      },
      writerOpts: {
        commitsSort: ['subject', 'scope'],
      },
    },
  ],
];

const prepare = [
  '@semantic-release/changelog',
  [
    '@semantic-release/npm',
    {
      npmPublish: false,
    },
  ],
  [
    '@semantic-release/git',
    {
      assets: ['package.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]',
    },
  ],
];

const publish = [
  [
    '@semantic-release/github',
    {
      assets,
    },
  ],
  [
    '@semantic-release/npm',
    {
      npmPublish: false,
    },
  ],
];

const verifyRelease = [];
const fail = [];
const success = [];
const addChannel = [];

module.exports = {
  repositoryUrl:
    ' https://github.com/brunohafonso95/weather-api.git',
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    'develop',
    '(RC)+([0-9])?({+([0-9])})',
    '(sprint)+([0-9])?({+([0-9])})',
  ],
  verifyConditions,
  analyzeCommits,
  verifyRelease,
  generateNotes,
  prepare,
  publish,
  fail,
  success,
  addChannel,
};
