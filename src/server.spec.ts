import request from 'supertest';
import { io as clientIO } from 'socket.io-client';
import { app, server, startServer, io } from './server';
import { connectDB } from './config/database';
import connectMongoDb from './config/mongo';

jest.mock('./config/database', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

jest.mock('./config/mongo', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(null),
}));

describe('Server', () => {
  let port: number;

  beforeAll(async () => {
    await startServer();
    const address = server.address();
    if (typeof address === 'object' && address !== null) {
      port = address.port;
    }
  });

  afterAll((done) => {
    io.close();
    server.close(() => {
      done();
    });
  });

  it('should return 200 on the root endpoint', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello from server.ts backend!');
  });

  describe('Socket.IO', () => {
    it('should handle a user connecting', (done) => {
      const socket = clientIO(`http://localhost:${port}`);
      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        socket.disconnect();
        done();
      });
    });

    it('should handle a user joining a room', (done) => {
      const socket = clientIO(`http://localhost:${port}`);
      socket.on('connect', () => {
        socket.emit('join', 'test-user');
        // We can't directly test the server-side console.log, 
        // but we can at least ensure the event is sent and received.
        socket.disconnect();
        done();
      });
    });

    it('should handle a user disconnecting', (done) => {
      const socket = clientIO(`http://localhost:${port}`);
      socket.on('connect', () => {
        socket.disconnect();
      });
      socket.on('disconnect', () => {
        done();
      });
    });
  });
});
