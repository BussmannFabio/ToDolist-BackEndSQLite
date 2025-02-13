import express from 'express';
import cors from 'cors';
import usersRoutes from '../users/users.js';
import authRoutes from '../auth/auth.js';
import toDolistRoutes from '../toDolist/toDolist.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:4200', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
}));

app.use(express.json());

app.use('/users', usersRoutes);
app.use('/login', authRoutes);
app.use('/toDolist', toDolistRoutes);

export default app;
