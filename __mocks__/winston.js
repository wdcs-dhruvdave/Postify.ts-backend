module.exports = {
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
  transports: {
    Console: jest.fn(),
  },
  format: {
    combine: jest.fn(() => jest.fn()),
    timestamp: jest.fn(() => jest.fn()),
    printf: jest.fn(() => jest.fn()),
    colorize: jest.fn(() => jest.fn()),
  },
};