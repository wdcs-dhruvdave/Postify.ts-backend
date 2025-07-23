import express from 'express'
import authRouter from './routes/auth.routes';
import postRouter from './routes/post.routes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


const app = express()
const PORT = 4000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


app.use('/api/auth', authRouter)
app.use('/api/posts', postRouter)

app.get('/', (req, res) => {
  res.send('Hello from server.ts backend!')
})


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
