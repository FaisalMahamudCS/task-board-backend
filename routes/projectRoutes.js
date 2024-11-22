import express from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Middleware to authenticate JWT


// Create a new project (Admin only)
router.post('/', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get all projects for the logged-in user
router.get('/', authenticate, async (req, res) => {
    try {
        const projects = await Project.find({ members: req.user.id }).populate('members', 'username email');
        res.json(projects);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Add a user to a project (Admin only)
router.post('/:projectId/members', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).send('Project not found');
        project.members.push(req.body.userId);
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete a project (Admin only)
router.delete('/:projectId', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        await Project.findByIdAndDelete(req.params.projectId);
        res.send('Project deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default router;
