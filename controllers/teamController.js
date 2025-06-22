const Team = require('../models/team_model');
const User = require('../models/user_model');
const { sendTeamRegistrationEmail, sendPaymentConfirmationEmail } = require('../services/emailService');
const Event = require('../models/eventModel');


const registerForEvent = async (req, res) => {
    const userId = req.params.id;
    const { eventId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user has already registered for the event
        const existingEvent = user.events.find(e => e.event === eventId);
        if (existingEvent) {
            return res.status(400).json({ error: 'You have already registered for this event' });
        }

        // Find the event and check registration availability
        const event = await Event.findOne({ event_id: eventId });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!event.canRegister()) {
            return res.status(400).json({ error: 'Event registration limit reached' });
        }

        // Add event to user's events array
        user.events.push({ event: eventId });
        user.registrationType = 'individual';
        await user.save();

        // Increment event registration count
        await event.incrementRegistration();

        // Send registration email
        await sendTeamRegistrationEmail(user.email, null, 'individual');

        res.status(201).json({
            message: 'Event registration successful',
            registrationType: 'individual'
        });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
};



const completePayment = async (req, res) => {
    const { userId, transactionId, amount } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.paymentStatus === 'completed') {
            return res.status(400).json({ message: 'Payment is already completed. Please register for events.' });
        }

        // Check if the transactionId already exists for any user to avoid duplicates
        const existingTransaction = await User.findOne({ "paymentDetails.transactionId": transactionId });
        if (existingTransaction) {
            return res.status(400).json({ error: 'Duplicate transaction ID. Payment already recorded.' });
        }

        // Update the user's payment status and details
        user.paymentStatus = 'completed';
        user.paymentDetails = {
            amount,
            transactionId,
            paymentDate: new Date()
        };

        await user.save();

        await sendPaymentConfirmationEmail(user.email, amount, transactionId, userId);

        res.json({
            message: 'Payment completed successfully',
            paymentStatus: 'completed',
            paymentDetails: user.paymentDetails
        });
    } catch (error) {
        res.status(400).json({ error: 'Payment completion failed', details: error.message });
    }
};

const registerTeam = async (req, res) => {
    const { teamName, memberIds, eventId } = req.body;

    try {
        // Find users by memberIds
        const members = await User.find({ _id: { $in: memberIds } });
        if (members.length !== memberIds.length) {
            return res.status(404).json({ error: 'One or more users not found' });
        }

        // Check for duplicate member IDs
        const uniqueMemberIds = new Set(memberIds);
        if (uniqueMemberIds.size !== memberIds.length) {
            return res.status(400).json({ error: 'Duplicate member IDs are not allowed' });
        }

        // Check payment status for all team members
        const unpaidMembers = members.filter(member => 
            member.paymentStatus !== 'completed' && member.paymentStatus !== 'received'
        );

        if (unpaidMembers.length > 0) {
            return res.status(400).json({
                error: 'Payment pending for some team members',
                unpaidMembers: unpaidMembers.map(member => ({
                    username: member.username,
                    email: member.email,
                    paymentStatus: member.paymentStatus
                }))
            });
        }

        // Find the event and check registration availability
        const event = await Event.findOne({ event_id: eventId });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (!event.canRegister()) {
            return res.status(400).json({ error: 'Event registration limit reached' });
        }

        // Check if any team member is already registered for this event
        for (const member of members) {
            const existingEvent = member.events.find(e => e.event === eventId);
            if (existingEvent) {
                return res.status(400).json({
                    error: `User ${member.username} has already registered for this event`
                });
            }
        }

        // Verify all members have payment details
        const membersWithoutPayment = members.filter(member => !member.paymentDetails);
        if (membersWithoutPayment.length > 0) {
            return res.status(400).json({
                error: 'Payment details missing for some team members',
                members: membersWithoutPayment.map(member => member.username)
            });
        }

        // Create a new team
        const team = new Team({
            teamName,
            leader: members[0]._id, // First member as leader
            members: members.map(member => ({
                userId: member._id,
                name: member.username,
                email: member.email,
                paymentDetails: {
                    transactionId: member.paymentDetails.transactionId,
                    paymentDate: member.paymentDetails.paymentDate,
                    amount: member.paymentDetails.amount
                }
            })),
            teamSize: members.length
        });

        await team.save();

        // Update each member with the event and team information
        for (const member of members) {
            member.events.push({ event: eventId, team: team._id });
            member.teamIds.addToSet(team._id);
            member.registrationType = 'team';
            await member.save();
        }

        // Increment event registration count once for the whole team
        await event.incrementRegistration();

        // Send confirmation emails to all members
        for (const member of members) {
            await sendTeamRegistrationEmail(member.email, teamName, 'team', members.length);
        }

        res.status(201).json({
            message: 'Team registered successfully',
            teamId: team._id,
            teamSize: members.length,
            teamName,
            members: members.map(member => ({
                username: member.username,
                email: member.email,
                paymentStatus: member.paymentStatus,
                paymentDetails: {
                    transactionId: member.paymentDetails.transactionId,
                    paymentDate: member.paymentDetails.paymentDate
                }
            }))
        });
    } catch (error) {
        res.status(400).json({ error: 'Team registration failed: ' + error.message });
    }
};

const verifyPayment = async (req, res) => {
    const { userId } = req.body;
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the top-level payment status
        user.paymentStatus = 'received';
        await user.save();

        res.json({
            message: 'Payment verified successfully',
            paymentStatus: user.paymentStatus
        });
    } catch (error) {
        res.status(400).json({ error: 'Payment verification failed' });
    }
};

// Controller to get events a user has participated in
// Combined controller to fetch user details along with their events
const getUserWithEvents = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find the user by ID
      const user = await User.findById(userId);
      
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Extract event_ids from user's events array
      const eventIds = user.events.map(event => event.event);
  
      // Fetch the full event details for each event_id in eventIds
      const userEvents = await Event.find({ event_id: { $in: eventIds } });
  
      // Return both user details and their registered events
      res.status(200).json({
        user,
        events: userEvents
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch user or user events' });
    }
  };

const getEventStats = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findOne({ event_id: eventId });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const individualRegistrations = await User.countDocuments({
            'events.event': eventId,
            registrationType: 'individual'
        });

        const teamRegistrations = await Team.countDocuments({ 
            'members.0.event': eventId 
        });

        const uniqueParticipants = await User.countDocuments({
            'events.event': eventId
        });

        res.json({
            totalRegistrations: individualRegistrations + teamRegistrations, // Each team counts as 1 registration
            individualRegistrations,
            teamRegistrations,
            totalParticipants: uniqueParticipants,
            registrationsCompleted: event.registrations_completed,
            maxRegistrations: event.max_registrations
        });
    } catch (error) {
        res.status(400).json({ error: 'Failed to retrieve event statistics' });
    }
};

const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVerifiedPayments = await User.countDocuments({ paymentStatus: 'completed' });
        
        // Get all events
        const events = await Event.find();
        
        // Total registrations is the sum of registrations_completed across all events
        const totalRegistrations = events.reduce((sum, event) => sum + event.registrations_completed, 0);

        // Registration trend by day
        const registrationsByDay = await Event.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    registrations: { $sum: "$registrations_completed" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalTeams = await Team.countDocuments();

        res.json({
            totalUsers,
            totalVerifiedPayments,
            totalRegistrations,
            registrationsByDay,
            totalTeams,
            eventsBreakdown: events.map(event => ({
                eventId: event.event_id,
                eventName: event.event_name,
                registrations: event.registrations_completed,
                maxRegistrations: event.max_registrations
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Multi-model filter controller
const filterResults = async (req, res) => {
    try {
        const { username, email, paymentStatus, teamName, event_id, event_name } = req.query;

        // Step 1: Set up filters
        let userFilters = {};
        let teamFilters = {};
        let eventFilters = {};

        // User-specific filters
        if (username) userFilters.username = { $regex: username, $options: 'i' };
        if (email) userFilters.email = { $regex: email, $options: 'i' };
        if (paymentStatus) userFilters.paymentStatus = paymentStatus;

        // Team-specific filters
        if (teamName) teamFilters.teamName = { $regex: teamName, $options: 'i' };

        // Event-specific filters
        if (event_id) eventFilters.event_id = event_id;
        if (event_name) eventFilters.event_name = { $regex: event_name, $options: 'i' };

        // Step 2: Fetch data based on filters
        const [users, teams, events] = await Promise.all([
            User.find(userFilters).populate('teamIds').populate('events.team'),
            Team.find(teamFilters).populate('leader').populate('members.userId'),
            Event.find(eventFilters)
        ]);

        // Step 3: Filter teams based on event_id if provided
        if (event_id) {
            const eventTeams = teams.filter(team =>
                team.members.some(member => 
                    users.find(user => user.events.some(event => event.event.toString() === event_id))
                )
            );
            return res.json({ users, teams: eventTeams, events });
        }

        res.json({ users, teams, events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = { registerForEvent, completePayment, registerTeam, verifyPayment ,getEventStats,getStats,getUserWithEvents,filterResults};