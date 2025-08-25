import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import indexRouter from './routes/index.routes';
import { connectDB } from './config/database';   
import connectMongoDb from './config/mongo';    

dotenv.config();

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = 4000;

app.use(cors({
  origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true, 
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', indexRouter);

app.get('/', (req, res) => {
  res.send('Hello from server.ts backend!');
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User with socket ID ${socket.id} joined room ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(' A user disconnected:', socket.id);
  });
});


const startServer = async () => {
  try {
    await connectDB();
    await connectMongoDb();

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();

export { io };