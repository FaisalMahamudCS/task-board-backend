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

import { createServer,  } from 'http';
import  cors  from 'cors';

import { Server as SocketIOServer } from 'socket.io';



var app = express();
app.use(cors())

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
export const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:3000", // Replace with your frontend URL
        methods: ["GET", "POST"],
    },
});
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
    socket.on("joinProject", (projectId) => {
        socket.join(projectId);
        console.log(`User joined project room: ${projectId}`);
    });
    
    // Leave a project room
    socket.on("leaveProject", (projectId) => {
        socket.leave(projectId);
        console.log(`User left project room: ${projectId}`);
    });
    
    // Handle task updates and broadcast them to the room
    socket.on("taskUpdated", (data) => {
        console.log(`Task updated in project: ${data.projectId}`);
        io.emit("taskUpdated", data);
    });
    
    // Handle new tasks and broadcast them to the room
    socket.on("taskAdded", (data) => {
        console.log(`New task added to project: ${data.projectId}`);
        io.emit("taskAdded", data);
    });
    
});

// Handle disconnection
// socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
// });

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});

