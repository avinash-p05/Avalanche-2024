// controllers/eventParticipantsController.js
const Event = require('../models/eventModel');
const User = require('../models/user_model');
const Team = require('../models/team_model');
const XLSX = require('xlsx');
const PaperPresentation = require('../models/paperPresentationModel')
const fs = require('fs');
const path = require('path');
const ExcelJS  = require('exceljs');

const getEventParticipants = async (req, res) => {
    try {
        // Get all events
        const events = await Event.find({});
        
        // Initialize array to store final result
        const eventParticipantsData = [];

        // Process each event
        for (const event of events) {
            const eventData = {
                event_id: event.event_id,
                event_name: event.event_name,
                department: event.department,
                event_type: event.event_type,
                total_registrations: event.registrations_completed,
                participants: []
            };

            // Find all users who registered for this event
            // Modified to use exact event_id match
            const registeredUsers = await User.find({
                'events.event': event.event_id
            }).select('-password -verificationToken -resetPasswordOTP -resetPasswordOTPExpiry');

            // Process each registered user
            for (const user of registeredUsers) {
                // Find the specific event registration
                const eventRegistration = user.events.find(e => e.event === event.event_id);
                
                // Convert event_type to uppercase for case-insensitive comparison
                const normalizedEventType = event.event_type.toUpperCase();
                
                if (normalizedEventType === 'INDIVIDUAL') {
                    // For individual events, just add the user details
                    eventData.participants.push({
                        participant_type: 'individual',
                        user_details: {
                            _id: user._id,
                            username: user.username,
                            email: user.email,
                            usn: user.usn,
                            paymentStatus: user.paymentStatus,
                            registrationType: user.registrationType
                        }
                    });
                } else if (['TEAM', 'TEAM EVENT'].includes(normalizedEventType)) {
                    // For team events, get team details
                    const teamId = eventRegistration.team;
                    if (teamId) {
                        // Use lean() to get plain JavaScript objects and improve performance
                        const team = await Team.findById(teamId)
                            .populate('leader', 'username email usn paymentStatus registrationType')
                            .populate('members.userId', 'username email usn paymentStatus registrationType')
                            .lean();

                        if (team) {
                            const teamData = {
                                participant_type: 'team',
                                team_details: {
                                    _id: team._id,
                                    teamName: team.teamName,
                                    teamSize: team.teamSize,
                                    registrationComplete: team.registrationComplete,
                                    leader: {
                                        _id: team.leader._id,
                                        username: team.leader.username,
                                        email: team.leader.email,
                                        usn: team.leader.usn,
                                        paymentStatus: team.leader.paymentStatus,
                                        registrationType: team.leader.registrationType
                                    },
                                    members: team.members.map(member => ({
                                        _id: member.userId._id,
                                        username: member.userId.username,
                                        email: member.userId.email,
                                        usn: member.userId.usn,
                                        paymentStatus: member.userId.paymentStatus,
                                        registrationType: member.userId.registrationType,
                                        memberPaymentStatus: member.paymentStatus
                                    })).filter(member => member._id) // Filter out any null members
                                }
                            };
                            
                            // Only add team if not already added
                            const teamExists = eventData.participants.some(
                                p => p.participant_type === 'team' && 
                                p.team_details._id.toString() === team._id.toString()
                            );
                            
                            if (!teamExists) {
                                eventData.participants.push(teamData);
                            }
                        }
                    }
                }
            }

            // Add event data even if there are no participants
            eventParticipantsData.push(eventData);
        }

        // Add debugging information in development environment
        const debug = {
            totalEvents: events.length,
            eventsWithParticipants: eventParticipantsData.filter(e => e.participants.length > 0).length,
            totalParticipants: eventParticipantsData.reduce((acc, event) => acc + event.participants.length, 0)
        };

        return res.status(200).json({
            success: true,
            debug: process.env.NODE_ENV === 'development' ? debug : undefined,
            data: eventParticipantsData
        });

    } catch (error) {
        console.error('Error in getEventParticipants:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};



const exportEventParticipants = async (req, res) => {
    try {
        // Fetch all events in a single query
        const events = await Event.find({}).lean();
        if (!events.length) {
            return res.status(404).json({
                success: false,
                message: 'No events found',
            });
        }

        // Create event ID to name mapping for quick lookup
        const eventMap = new Map(events.map(event => [event.event_id.toString(), event]));

        // Fetch all users with events in a single query with necessary fields
        const users = await User.find(
            { 'events': { $exists: true, $ne: [] } },
            {
                username: 1,
                email: 1,
                usn: 1,
                paymentStatus: 1,
                registrationType: 1,
                events: 1
            }
        ).lean();

        // Get unique team IDs from all users
        const teamIds = new Set();
        users.forEach(user => {
            user.events.forEach(event => {
                if (event.team) teamIds.add(event.team.toString());
            });
        });

        // Fetch all teams in a single query
        const teams = await Team.find(
            { _id: { $in: Array.from(teamIds) } },
            {
                teamName: 1,
                teamSize: 1,
                leader: 1,
                members: 1,
                event: 1
            }
        ).lean();

        // Create team lookup map
        const teamMap = new Map(teams.map(team => [team._id.toString(), team]));

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Your Application';
        workbook.created = new Date();

        // Process each event
        for (const event of events) {
            const sheet = workbook.addWorksheet(event.event_name);

            // Define columns
            sheet.columns = [
                { header: 'Participant Type', key: 'participant_type', width: 20 },
                { header: 'Username', key: 'username', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'USN', key: 'usn', width: 15 },
                { header: 'Payment Status', key: 'paymentStatus', width: 15 },
                { header: 'Registration Type', key: 'registrationType', width: 20 },
                { header: 'Team Name', key: 'teamName', width: 20 },
                { header: 'Team Size', key: 'teamSize', width: 10 },
            ];

            const addedUsers = new Set();
            const normalizedEventType = event.event_type.toUpperCase();
            const eventId = event.event_id.toString();

            // Filter users for this event
            const eventUsers = users.filter(user => 
                user.events.some(e => e.event.toString() === eventId)
            );

            for (const user of eventUsers) {
                const eventRegistration = user.events.find(
                    e => e.event.toString() === eventId
                );

                if (normalizedEventType === 'INDIVIDUAL') {
                    if (!addedUsers.has(user._id.toString())) {
                        sheet.addRow({
                            participant_type: 'Individual',
                            username: user.username,
                            email: user.email,
                            usn: user.usn,
                            paymentStatus: user.paymentStatus,
                            registrationType: user.registrationType,
                        });
                        addedUsers.add(user._id.toString());
                    }
                } else if (['TEAM', 'TEAM EVENT'].includes(normalizedEventType)) {
                    const teamId = eventRegistration?.team?.toString();
                    if (teamId) {
                        const team = teamMap.get(teamId);
                        if (team && !addedUsers.has(team.leader.toString())) {
                            // Add team leader
                            const leaderData = users.find(u => u._id.toString() === team.leader.toString());
                            if (leaderData) {
                                sheet.addRow({
                                    participant_type: 'Team Leader',
                                    username: leaderData.username,
                                    email: leaderData.email,
                                    usn: leaderData.usn,
                                    paymentStatus: leaderData.paymentStatus,
                                    registrationType: leaderData.registrationType,
                                    teamName: team.teamName,
                                    teamSize: team.teamSize,
                                });
                                addedUsers.add(team.leader.toString());
                            }

                            // Add team members
                            for (const member of team.members) {
                                const memberId = member.userId.toString();
                                if (!addedUsers.has(memberId)) {
                                    const memberData = users.find(u => u._id.toString() === memberId);
                                    if (memberData) {
                                        sheet.addRow({
                                            participant_type: 'Team Member',
                                            username: memberData.username,
                                            email: memberData.email,
                                            usn: memberData.usn,
                                            paymentStatus: memberData.paymentStatus,
                                            registrationType: memberData.registrationType,
                                            teamName: team.teamName,
                                            teamSize: team.teamSize,
                                        });
                                        addedUsers.add(memberId);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Style the sheet
            sheet.getRow(1).font = { bold: true };
            sheet.columns.forEach(column => {
                column.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        }

        // Stream response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="Event_Participants.xlsx"'
        );
        
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error in exportEventParticipants:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
};



const getEventParticipantsByEventId = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Find the event
        const event = await Event.findOne({ event_id: eventId });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Initialize event data
        const eventData = {
            event_id: event.event_id,
            event_name: event.event_name,
            department: event.department,
            event_type: event.event_type,
            total_registrations: event.registrations_completed,
            participants: []
        };

        // Find all users who registered for this event
        const registeredUsers = await User.find({
            'events.event': eventId
        }).select('-password -verificationToken -resetPasswordOTP -resetPasswordOTPExpiry');

        // Process each registered user
        for (const user of registeredUsers) {
            // Find the specific event registration
            const eventRegistration = user.events.find(e => e.event === eventId);
            
            // Convert event_type to uppercase for case-insensitive comparison
            const normalizedEventType = event.event_type.toUpperCase();
            
            if (normalizedEventType === 'INDIVIDUAL') {
                // For individual events, add user details
                eventData.participants.push({
                    participant_type: 'individual',
                    user_details: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        usn: user.usn,
                        paymentStatus: user.paymentStatus,
                        registrationType: user.registrationType
                    }
                });
            } else if (['TEAM', 'TEAM EVENT'].includes(normalizedEventType)) {
                // For team events, get team details
                const teamId = eventRegistration.team;
                if (teamId) {
                    const team = await Team.findById(teamId)
                        .populate('leader', 'username email usn paymentStatus registrationType')
                        .populate('members.userId', 'username email usn paymentStatus registrationType')
                        .lean();

                    if (team) {
                        const teamData = {
                            participant_type: 'team',
                            team_details: {
                                _id: team._id,
                                teamName: team.teamName,
                                teamSize: team.teamSize,
                                registrationComplete: team.registrationComplete,
                                leader: {
                                    _id: team.leader._id,
                                    username: team.leader.username,
                                    email: team.leader.email,
                                    usn: team.leader.usn,
                                    paymentStatus: team.leader.paymentStatus,
                                    registrationType: team.leader.registrationType
                                },
                                members: team.members
                                    .filter(member => member.userId) // Filter out any null members
                                    .map(member => ({
                                        _id: member.userId._id,
                                        username: member.userId.username,
                                        email: member.userId.email,
                                        usn: member.userId.usn,
                                        paymentStatus: member.userId.paymentStatus,
                                        registrationType: member.userId.registrationType,
                                        memberPaymentStatus: member.paymentStatus
                                    }))
                            }
                        };
                        
                        // Only add team if not already added
                        const teamExists = eventData.participants.some(
                            p => p.participant_type === 'team' && 
                            p.team_details._id.toString() === team._id.toString()
                        );
                        
                        if (!teamExists) {
                            eventData.participants.push(teamData);
                        }
                    }
                }
            }
        }

        // Add debugging information in development environment
        const debug = {
            eventFound: !!event,
            registeredUsersCount: registeredUsers.length,
            participantsCount: eventData.participants.length,
            eventType: event.event_type,
            normalizedEventType: event.event_type.toUpperCase()
        };

        return res.status(200).json({
            success: true,
            debug: process.env.NODE_ENV === 'development' ? debug : undefined,
            data: eventData
        });

    } catch (error) {
        console.error('Error in getEventParticipantsByEventId:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Add a helper function to get team details
const getTeamDetails = async (teamId) => {
    try {
        const team = await Team.findById(teamId)
            .populate('leader', 'username email usn paymentStatus registrationType')
            .populate('members.userId', 'username email usn paymentStatus registrationType')
            .lean();

        if (!team) return null;

        return {
            _id: team._id,
            teamName: team.teamName,
            teamSize: team.teamSize,
            registrationComplete: team.registrationComplete,
            leader: {
                _id: team.leader._id,
                username: team.leader.username,
                email: team.leader.email,
                usn: team.leader.usn,
                paymentStatus: team.leader.paymentStatus,
                registrationType: team.leader.registrationType
            },
            members: team.members
                .filter(member => member.userId)
                .map(member => ({
                    _id: member.userId._id,
                    username: member.userId.username,
                    email: member.userId.email,
                    usn: member.userId.usn,
                    paymentStatus: member.userId.paymentStatus,
                    registrationType: member.userId.registrationType,
                    memberPaymentStatus: member.paymentStatus
                }))
        };
    } catch (error) {
        console.error('Error in getTeamDetails:', error);
        return null;
    }
};


// Controller to get list of payment details
const getPaymentDetails = async (req, res) => {
    try {
        // Find users with completed or received payments
        const usersWithPayment = await User.find({ paymentStatus: { $in: ['completed', 'received'] } })
            .select('username email usn paymentDetails');

        // Format each user's payment details to IST
        const paymentDetailsList = usersWithPayment.map(user => {
            // Convert paymentDate to IST (Indian Standard Time)
            const paymentDateIST = new Date(user.paymentDetails.paymentDate).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata'
            });

            return {
                username: user.username,
                email: user.email,
                usn: user.usn,
                transactionId: user.paymentDetails.transactionId,
                paymentDate: paymentDateIST
            };
        });

        res.status(200).json(paymentDetailsList);
    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({ message: 'Error fetching payment details' });
    }
};


const getPaymentDetailsExcel = async (req, res) => {
    try {
        // Fetch users with completed or received payments
        const usersWithPayment = await User.find({ paymentStatus: { $in: ['completed', 'received'] } })
            .select('username email usn paymentDetails');

        // Prepare data for Excel with IST formatted date
        const paymentDetailsList = usersWithPayment.map(user => {
            const paymentDateIST = new Date(user.paymentDetails.paymentDate).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata'
            });

            return {
                username: user.username,
                email: user.email,
                usn: user.usn,
                transactionId: user.paymentDetails.transactionId,
                paymentDate: paymentDateIST
            };
        });

        // Create a worksheet from the data
        const worksheet = XLSX.utils.json_to_sheet(paymentDetailsList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PaymentDetails');

        // Generate the Excel file path
        const filePath = path.join(__dirname, '../uploads', 'PaymentDetails.xlsx');

        // Write workbook to file
        XLSX.writeFile(workbook, filePath);

        // Send file as response
        res.download(filePath, 'PaymentDetails.xlsx', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Could not download file');
            }
            // Delete the file after sending it
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error exporting payment details:', error);
        res.status(500).json({ message: 'Error exporting payment details' });
    }
};

const exportPaperPresentation = async (req, res) => {
    try {
        const presentations = await PaperPresentation.find({})
            .populate({
                path: 'userId',
                populate: { path: 'teamIds', model: 'Team' }
            });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Paper Presentations');

        // Add header row
        worksheet.addRow(['Department', 'Topic', 'Team Name', 'Members']);

        // Keep track of processed presentations
        presentations.forEach((presentation) => {
            if (!presentation.userId) {
                console.warn(`Paper presentation ${presentation._id} has no valid userId.`);
                worksheet.addRow([presentation.department, presentation.topic, 'No User', 'No Team']);
                return;
            }

            const user = presentation.userId;
            if (!user.teamIds || user.teamIds.length === 0) {
                console.warn(`User ${user._id} has no teamIds.`);
                worksheet.addRow([presentation.department, presentation.topic, 'No Team', 'No Members']);
                return;
            }

            // Consolidate team and member data
            const teams = user.teamIds.map((team) => ({
                teamName: team.teamName || 'No Team Name',
                members: team.members
                    ? team.members.map(member => `${member.name || 'Unknown'} (${member.email || 'No Email'})`).join(', ')
                    : 'No Members'
            }));

            // Add a single row for each presentation, consolidating team data
            const consolidatedTeams = teams.map(team => `${team.teamName}: ${team.members}`).join(' | ');

            worksheet.addRow([presentation.department, presentation.topic, consolidatedTeams]);
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=paper_presentations.xlsx');

        // Write workbook to response
        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error('Error exporting paper presentations:', error);
        res.status(500).json({ message: 'Failed to export paper presentations', error: error.message });
    }
};

// Comprehensive USN Regex Patterns for each department
const departmentPatterns = {
    Mechanical: {
        patterns: [
            /^[1-2]gi\d{2}me\d{3}$/i,              // 2GI22ME025
            /^git\d{2}me-?\d{3}-?t?$/i,            // GIT24ME-088-T
            /^[1-2]gi\d{2}me\s*\d{3}$/i,           // 2GI22ME 057
            /^git\d{2}me\d{3}-?t?$/i               // GIT24ME088T
        ],
        emailPattern: /^\d{2}u\d{4}$/i             // 24u0852
    },
    Aeronautical: {
        patterns: [
            /^[1-2]gi\d{2}ae\d{3}$/i,
            /^git\d{2}ae-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}ae\s*\d{3}$/i,
            /^git\d{2}ae\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    Architecture: {

        patterns: [
            /^[1-2]gi\d{2}at\d{3}$/i,              // 2GI22AT025
            /^git\d{2}at-?\d{3}-?t?$/i,            // GIT24AT-088-T
            /^[1-2]gi\d{2}at\s*\d{3}$/i,           // 2GI22AT 057
            /^git\d{2}at\d{3}-?t?$/i               // GIT24AT088T
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    ComputerScience: {
        patterns: [
            /^[1-2]gi\d{2}cs\d{3}$/i,
            /^git\d{2}cs-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}cs\s*\d{3}$/i,
            /^git\d{2}cs\d{3}-?t?$/i,
            /^[1-2]gi\d{2}bcs\d{3}$/i,             // BSc Computer Science
            /^git\d{2}bcs-?\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    InformationScience: {
        patterns: [
            /^[1-2]gi\d{2}is\d{3}$/i,
            /^git\d{2}is-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}is\s*\d{3}$/i,
            /^git\d{2}is\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    Civil: {
        patterns: [
            /^[1-2]gi\d{2}cv\d{3}$/i,
            /^git\d{2}cv-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}cv\s*\d{3}$/i,
            /^git\d{2}cv\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    Electronics: {
        patterns: [
            /^[1-2]gi\d{2}ec\d{3}$/i,
            /^git\d{2}ec-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}ec\s*\d{3}$/i,
            /^git\d{2}ec\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    },
    Electrical: {
        patterns: [
            /^[1-2]gi\d{2}ee\d{3}$/i,
            /^git\d{2}ee-?\d{3}-?t?$/i,
            /^[1-2]gi\d{2}ee\s*\d{3}$/i,
            /^git\d{2}ee\d{3}-?t?$/i
        ],
        emailPattern: /^\d{2}u\d{4}$/i
    }
};

// Utility function to extract department and year from various formats
const extractDepartmentInfo = (usn, email) => {
    // Remove any spaces and convert to uppercase for consistent processing
    const cleanUSN = usn.replace(/\s+/g, '').toUpperCase();
    
    // First try to detect department from USN
    for (const [department, patterns] of Object.entries(departmentPatterns)) {
        for (const pattern of patterns.patterns) {
            if (pattern.test(cleanUSN)) {
                return {
                    department,
                    year: extractYear(cleanUSN, email)
                };
            }
        }
    }
    
    // If USN pattern doesn't match, try to detect from email
    if (email) {
        const emailPrefix = email.split('@')[0];
        // Try to extract year and check email pattern
        for (const [department, patterns] of Object.entries(departmentPatterns)) {
            if (patterns.emailPattern.test(emailPrefix)) {
                return {
                    department: 'Other', // Since we can't determine department from email alone
                    year: extractYearFromEmail(email)
                };
            }
        }
    }
    
    return {
        department: 'Other',
        year: 'Unknown'
    };
};

// Utility function to extract year from various formats
const extractYear = (usn, email) => {
    // Try different year patterns
    const yearPatterns = [
        /git(\d{2})/i,           // GIT24ME-088-T
        /^[1-2]gi(\d{2})/i,      // 2GI22ME025
        /(\d{2})(?:me|ae|cs|is|cv|ec|ee)/i  // Various department codes
    ];
    
    for (const pattern of yearPatterns) {
        const match = usn.match(pattern);
        if (match) {
            return `20${match[1]}`;
        }
    }
    
    // If year not found in USN, try email
    if (email) {
        return extractYearFromEmail(email);
    }
    
    return 'Unknown';
};

// Utility function to extract year from email
const extractYearFromEmail = (email) => {
    const emailPrefix = email.split('@')[0];
    const yearMatch = emailPrefix.match(/^(\d{2})/);
    return yearMatch ? `20${yearMatch[1]}` : 'Unknown';
};

// Utility function to normalize USN format
const normalizeUSN = (usn) => {
    // Remove spaces and convert to uppercase
    const cleanUSN = usn.replace(/\s+/g, '').toUpperCase();
    
    // Add missing hyphens for GIT format if needed
    if (cleanUSN.startsWith('GIT')) {
        const match = cleanUSN.match(/^(GIT\d{2}[A-Z]{2})(\d{3})(T?)$/);
        if (match) {
            return `${match[1]}-${match[2]}${match[3] ? '-T' : ''}`;
        }
    }
    
    return cleanUSN;
};
// First add the styleWorksheet function
const styleWorksheet = (worksheet) => {
    // Get all cell addresses in the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Set column widths
    const cols = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
        cols.push({ wch: 15 }); // Default width of 15 characters
    }
    
    // Adjust specific column widths
    cols[cols.findIndex(c => c.wch === 15)] = { wch: 12 }; // USN
    cols[cols.findIndex(c => c.wch === 15) + 1] = { wch: 30 }; // Email
    cols[cols.findIndex(c => c.wch === 15) + 7] = { wch: 40 }; // Events
    cols[cols.findIndex(c => c.wch === 15) + 8] = { wch: 40 }; // Teams
    
    worksheet['!cols'] = cols;

    // Style header row
    for (let C = range.s.c; C <= range.e.c; C++) {
        const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!worksheet[headerAddress]) continue;
        
        worksheet[headerAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Style data cells
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellAddress]) continue;

            worksheet[cellAddress].s = {
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" }
                }
            };

            // Add alternating row colors
            if (R % 2 === 0) {
                worksheet[cellAddress].s.fill = { fgColor: { rgb: "F2F2F2" } };
            }
        }
    }
};
// Update the exportDepartmentData function to use the new utilities
// Update the exportDepartmentData function to filter out pending payments
const exportDepartmentData = async (req, res) => {
    try {
        const users = await User.find({ paymentStatus: 'completed' }).populate({
            path: 'teamIds',
            populate: {
                path: 'members.userId',
                model: 'User'
            }
        });

        const workbook = XLSX.utils.book_new();
        
        // Initialize department containers
        const departmentData = Object.fromEntries(
            [...Object.keys(departmentPatterns), 'Other'].map(dept => [dept, []])
        );

        // Process only users with completed payments
        users.forEach(user => {
            const { department, year } = extractDepartmentInfo(user.usn, user.email);
            const userData = {
                'USN': normalizeUSN(user.usn),
                'Email': user.email,
                'Year': year,
                'Name': user.username,
                'Registration Type': user.registrationType,
                'Payment Status': user.paymentStatus,
                'Number of Events': user.events ? user.events.length : 0,
                'Events': user.events ? user.events.map(e => e.event).join(', ') : '',
                'Teams': user.teamIds.map(t => t.teamName).join(', ')
            };
            
            departmentData[department].push(userData);
        });

        // Create department sheets
        Object.entries(departmentData).forEach(([department, students]) => {
            if (students.length > 0) {
                const sortedStudents = students.sort((a, b) => {
                    if (a.Year !== b.Year) {
                        return b.Year.localeCompare(a.Year);
                    }
                    return a.USN.localeCompare(b.USN);
                });

                const worksheet = XLSX.utils.json_to_sheet(sortedStudents);
                styleWorksheet(worksheet);
                XLSX.utils.book_append_sheet(workbook, worksheet, department);
            }
        });

        // Add summary sheet - only counting completed payments
        const summaryData = Object.entries(departmentData).map(([dept, students]) => ({
            'Department': dept,
            'Total Students': students.length,
            'Team Participants': students.filter(s => s.registrationType === 'team').length,
            'Individual Participants': students.filter(s => s.registrationType === 'individual').length,
            'Total Events Participation': students.reduce((sum, s) => sum + s['Number of Events'], 0)
        }));

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        styleWorksheet(summarySheet);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Generate and send file
        const fileName = `Department_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filePath = path.join(__dirname, '../uploads', fileName);
        
        XLSX.writeFile(workbook, filePath);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            require('fs').unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error in exporting department data:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting department data',
            error: error.message
        });
    }
};
const exportEventParticipation = async (req, res) => {
    try {
        // 1. Optimize aggregation pipeline with project and index
        const eventAggregation = await User.aggregate([
            // Only include fields we need
            {
                $project: {
                    events: 1,
                    usn: 1,
                    username: 1,
                    email: 1,
                    registrationType: 1,
                    paymentStatus: 1
                }
            },
            { $unwind: '$events' },
            {
                $group: {
                    _id: '$events.event',
                    participants: {
                        $push: {
                            usn: '$usn',
                            username: '$username',
                            email: '$email',
                            registrationType: '$registrationType',
                            paymentStatus: '$paymentStatus'
                        }
                    }
                }
            }
        ]).exec(); // Use exec() for better performance

        // 2. Process data in memory efficiently
        const workbook = XLSX.utils.book_new();
        
        // Pre-calculate department and batch info for all USNs
        const participantDetails = new Map();
        
        // 3. Create overview data efficiently
        const overviewData = eventAggregation.map(event => {
            const participants = event.participants;
            const teamCount = participants.reduce((count, p) => 
                p.registrationType === 'team' ? count + 1 : count, 0);
            
            return {
                'Event Name': event._id,
                'Total Participants': participants.length,
                'Team Participants': teamCount,
                'Individual Participants': participants.length - teamCount,
                'Payment Completed': participants.reduce((count, p) => 
                    p.paymentStatus === 'completed' ? count + 1 : count, 0),
                'Payment Pending': participants.reduce((count, p) => 
                    p.paymentStatus === 'pending' ? count + 1 : count, 0)
            };
        });

        // 4. Stream file creation
        const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Events Overview');

        // 5. Process events in batches
        for (const event of eventAggregation) {
            const participantData = event.participants.map(p => {
                // Get cached department info or calculate and cache it
                if (!participantDetails.has(p.usn)) {
                    participantDetails.set(p.usn, {
                        department: getDepartmentFromUSN(p.usn),
                        batchYear: getBatchYear(p.usn)
                    });
                }
                const details = participantDetails.get(p.usn);

                return {
                    'USN': p.usn.toUpperCase(),
                    'Name': p.username,
                    'Email': p.email,
                    'Department': details.department,
                    'Batch Year': details.batchYear,
                    'Registration Type': p.registrationType,
                    'Payment Status': p.paymentStatus
                };
            });

            // Sort efficiently using localeCompare only when needed
            participantData.sort((a, b) => {
                const deptCompare = a.Department.localeCompare(b.Department);
                return deptCompare !== 0 ? deptCompare : a.USN.localeCompare(b.USN);
            });

            const worksheet = XLSX.utils.json_to_sheet(participantData);
            XLSX.utils.book_append_sheet(workbook, worksheet, event._id.substring(0, 31));
        }

        // 6. Use streams for file operations
        const fileName = `Event_Participation_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filePath = path.join(__dirname, '../uploads', fileName);
        
        await fs.promises.mkdir(path.join(__dirname, '../uploads'), { recursive: true });

        // Write file using buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        await fs.promises.writeFile(filePath, buffer);

        // Stream the download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('end', () => {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });
        });

    } catch (error) {
        console.error('Error in exporting event participation:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting event participation data',
            error: error.message
        });
    }
};
module.exports = {
    getEventParticipants,
    getEventParticipantsByEventId,
    getPaymentDetails,
    getPaymentDetailsExcel,
    exportEventParticipants,
    exportPaperPresentation,
    exportDepartmentData,
    exportEventParticipation
};