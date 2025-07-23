import express from 'express'
import authRouter from './controller/auth/auth.controller';
import dotenv from 'dotenv';

dotenv.config();

const app = express()
const PORT = 4000

app.get('/', (req, res) => {
  res.send('Hello from server.ts backend!')
})

app.use(express.json())
app.use('/api/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
