import express from 'express'
import usersRoutes from '../users/users.js'
import authRoutes from '../auth/auth.js'
import toDolistRoutes from '../toDolist/toDolist.js'
import cors from 'cors'

const app = express()
app.use(cors())

app.use(express.json())

app.use('/users', usersRoutes)
app.use('/login', authRoutes)
app.use('/toDolist', toDolistRoutes)

export default app
