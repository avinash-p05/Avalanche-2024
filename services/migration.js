const mongoose = require('mongoose');
require('dotenv').config();

const migration = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const db = mongoose.connection;
        const usersCollection = db.collection('users');

        // 1. Drop the existing index if it exists
        try {
            await usersCollection.dropIndex('paymentDetails.transactionId_1');
            console.log('Existing index dropped successfully');
        } catch (error) {
            console.log('No existing index found to drop');
        }

        // 2. Create new partial index
        await usersCollection.createIndex(
            { 'paymentDetails.transactionId': 1 },
            { 
                unique: true,
                partialFilterExpression: { 'paymentDetails.transactionId': { $type: 'string' } }
            }
        );
        

        // 3. Update existing documents to ensure consistency
        const updateResult = await usersCollection.updateMany(
            { 
                paymentDetails: { $exists: true },
                'paymentDetails.transactionId': { $exists: true, $eq: null }
            },
            { 
                $unset: { 'paymentDetails.transactionId': '' }
            }
        );
        console.log(`Updated ${updateResult.modifiedCount} documents`);

        // 4. Validate the migration
        const invalidDocs = await usersCollection.find({
            'paymentDetails.transactionId': null
        }).toArray();

        if (invalidDocs.length > 0) {
            console.warn(`Warning: Found ${invalidDocs.length} documents with null transactionId`);
            console.warn('These documents may need manual review');
        } else {
            console.log('No invalid documents found');
        }

        // 5. Create backup of current state (optional but recommended)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupCollection = `users_backup_${timestamp}`;
        
        await db.createCollection(backupCollection);
        const pipeline = [{ $out: backupCollection }];
        await usersCollection.aggregate(pipeline).toArray();
        console.log(`Backup created in collection: ${backupCollection}`);

        console.log('Migration completed successfully');

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Add rollback functionality
const rollback = async () => {
    try {
        await mongoose.connect('mongodb+srv://nirajvernekar02:niraj1234@cluster0.3xs9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        const db = mongoose.connection;
        
        // Get the most recent backup collection
        const collections = await db.listCollections().toArray();
        const backupCollections = collections
            .map(c => c.name)
            .filter(name => name.startsWith('users_backup_'))
            .sort()
            .reverse();

        if (backupCollections.length === 0) {
            console.error('No backup collections found');
            return;
        }

        const mostRecentBackup = backupCollections[0];
        
        // Restore from backup
        await db.collection('users').drop();
        await db.collection(mostRecentBackup).aggregate([
            { $out: 'users' }
        ]).toArray();

        console.log('Rollback completed successfully');
        
    } catch (error) {
        console.error('Rollback failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

// Execute migration
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--rollback')) {
        rollback();
    } else {
        migration();
    }
}

module.exports = { migration, rollback };