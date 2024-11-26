// import { authenticate } from "../middleware/authenticate";

import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();


import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { io } from '../app.js';


// Get tasks for a project
router.get('/:projectId', authenticate, async (req, res) => {
    try {
        const projectId = new mongoose.Types.ObjectId(req.params.projectId);
        const tasks = await Task.find({ projectId: projectId})
        res.json(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Create a task (Project Manager)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'project_manager') return res.status(403).send('Forbidden');
    try {
        const task = await Task.create(req.body);
        io.emit('taskAdded', task);

        res.status(201).json(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Update task status or assign a task
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Role-specific update logic
        if (req.user.role === 'project_manager') {
            await updateTaskAsManager(task, req.body);
            io.emit('taskUpdated', task);
            console.log(`Emitted taskUpdated for projectId: ${task.projectId}`);


            return res.json(task);
        } else if (req.user.role === 'team_member' && req.body.status) {
            await updateTaskStatusAsMember(task, req.body.status);
            console.log(`Emitted taskUpdated for projectId: ${task.projectId}`);

            io.emit('taskUpdated', task);

            return res.json(task);
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(400).json({ message: error.message });
    }
};

const updateTaskAsManager = async (task, updates) => {
    Object.assign(task, updates);
    await task.save();
};

const updateTaskStatusAsMember = async (task, status) => {
    task.status = status;
    await task.save();
};

// Route definition
router.patch('/:taskId', authenticate, updateTask);

// Add a comment to a task
router.post('/:taskId/comments', authenticate, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).send('Task not found');
        task.comments.push({ text: req.body.text, user: req.user.id, date: new Date() });
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

export default router;
