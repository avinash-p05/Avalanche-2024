const cron = require('node-cron');
const User = require('../models/user_model'); // Adjust the path to your user model

// Function to schedule the cron job
function deleteUnverifiedUsers() {
    // Schedule the job to run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

            // Find and delete users who are unverified and created more than 15 minutes ago
            const result = await User.deleteMany({
                isVerified: false,
                createdAt: { $lt: fifteenMinutesAgo }
            });

            if (result.deletedCount > 0) {
                console.log(`Deleted ${result.deletedCount} unverified users.`);
            }
        } catch (error) {
            console.error('Error deleting unverified users:', error);
        }
    });
}

module.exports = deleteUnverifiedUsers;
