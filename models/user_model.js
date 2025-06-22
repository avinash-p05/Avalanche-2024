// userSchema.js
const mongoose = require('mongoose');

// Define the PaymentDetails schema
const paymentDetailsSchema = new mongoose.Schema({
    amount: { type: Number },
    transactionId: { 
        type: String,
        index: {
            unique: true,
            sparse: true,
            partialFilterExpression: { $type: "string" }
        }
    },
    paymentDate: { type: Date }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'received'], 
        default: 'pending'
    },
    registrationType: { 
        type: String, 
        enum: ['individual', 'team'], 
        required: true 
    },
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    verificationToken: String,
    profilePicture: { type: String },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpiry: { type: Date },
    // Make paymentDetails optional and don't set it during initial user creation
    paymentDetails: paymentDetailsSchema,
    events: [{
        event: { type: String },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
    }]
}, { timestamps: true });

// Drop existing index if it exists (run this once in your migration script)
const dropIndex = async () => {
    try {
        await mongoose.connection.collections.users.dropIndex('paymentDetails.transactionId_1');
    } catch (error) {
        // Index might not exist, ignore error
    }
};

module.exports = mongoose.model('User', userSchema);