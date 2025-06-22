// migrationRunner.js
require('dotenv').config();
const mongoose = require('mongoose');
const { migration, rollback } = require('./migration'); // Adjust path as needed

const runMigration = async () => {
    try {
        // First disconnect if there's an existing connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        // Check if we're running migration or rollback
        const args = process.argv.slice(2);
        if (args.includes('--rollback')) {
            console.log('Starting rollback process...');
            await rollback();
        } else {
            console.log('Starting migration process...');
            await migration();
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration runner failed:', error);
        process.exit(1);
    }
};

// Run the migration if this file is being executed directly
if (require.main === module) {
    runMigration();
}

module.exports = runMigration;