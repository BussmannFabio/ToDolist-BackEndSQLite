import express from 'express'
import usersRoutes from '../users/users.js'
import authRoutes from '../auth.js'

const app = express()


app.use(express.json())

app.use('/users', usersRoutes)
app.use('/login', authRoutes)

export default app