import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }, // Reference to Task
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
}, { timestamps: true });

export default mongoose.model('Comment', CommentSchema);
