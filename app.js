import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config'; // Automatically loads .env file


import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

import projectRoutes from './routes/projectRoutes.js';
import taskRouter from './routes/taskRoutes.js';
import authRouter from './routes/auth.js';

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';



var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/tasks', taskRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/projects', projectRoutes);
app.use('/auth', authRouter);


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('Database Connection Failed', err));

  // Create HTTP server and initialize Socket.io
const server = createServer(app);
const io = new SocketIOServer(server);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`User joined project: ${projectId}`);
    });

    socket.on('task_update', (data) => {
        io.to(data.projectId).emit('task_update', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});

