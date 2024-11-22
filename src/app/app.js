import express from 'express'
import usersRoutes from '../users/users.js'

const app = express()

app.use(express.json())
app.use('/', usersRoutes)

export default app