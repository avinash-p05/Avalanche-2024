const mongoose = require('mongoose');

const paperPresentationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    paperFile: {
        type: String
    },
    status: {
        type: String,
        enum: ['Submitted', 'Accepted', 'Rejected'],
        default: 'Submitted'
    },
    feedback: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('PaperPresentation', paperPresentationSchema);