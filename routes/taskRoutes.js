import { authenticate } from "../middleware/authenticate";

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');


// Get tasks for a project
router.get('/:projectId', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', 'username');
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
        res.status(201).json(task);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Update task status or assign a task
router.patch('/:taskId', authenticate, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).send('Task not found');
        
        // Allow Project Manager to assign tasks or update status
        if (req.user.role === 'project_manager') {
            Object.assign(task, req.body);
            await task.save();
            res.json(task);
        } else if (req.user.role === 'team_member' && req.body.status) {
            // Allow Team Member to update only task status
            task.status = req.body.status;
            await task.save();
            res.json(task);
        } else {
            res.status(403).send('Forbidden');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

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

module.exports = router;
