import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned user
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Reference to Project
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
    }],
}, { timestamps: true });

export default mongoose.model('Task', TaskSchema);
