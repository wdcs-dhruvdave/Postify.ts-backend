module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\\.ts$': 'babel-jest',
    '^.+\\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@so-ric/colorspace|winston|@dabh/diagnostics)/)',
  ],
  moduleNameMapper: {
    '^winston$': '<rootDir>/__mocks__/winston.js',
    '^@so-ric/colorspace$': '<rootDir>/__mocks__/@so-ric/colorspace.js',
  },
};