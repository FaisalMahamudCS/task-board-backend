import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Relational reference to User model
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator reference
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
