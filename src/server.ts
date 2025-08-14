import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';
import indexRouter from './routes/index.routes';
import {connectDB} from './config/database';

dotenv.config();


const app = express()
const PORT = 4000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', indexRouter)
app.get('/', (req, res) => {
  res.send('Hello from server.ts backend!')
})

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
