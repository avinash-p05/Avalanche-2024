const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: { type: String, required: true },
            email: { type: String, required: true },
            paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'completed' }
        }
    ],
    teamSize: { type: Number, required: true, min: 2, max: 4 },
    registrationComplete: { type: Boolean, default: true }
}, { timestamps: true });

// Validate team size
teamSchema.pre('save', function(next) {
    if (this.members.length < 2 || this.members.length > 4) {
        next(new Error('Team must have between 2 and 4 members'));
    }
    this.teamSize = this.members.length;
    next();
});

module.exports = mongoose.model('Team', teamSchema);