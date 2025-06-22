const express = require('express');
const { exportDepartmentData,exportEventParticipation,getEventParticipants ,exportPaperPresentation,getEventParticipantsByEventId,getPaymentDetails,getPaymentDetailsExcel,exportEventParticipants} = require('../controllers/analyticsController');

const router = express.Router();

// Route to get event-wise participation details
router.get('/event-participation', getEventParticipants);

router.get('/get-paper-presentation',exportPaperPresentation)

// Route to get participants for a specific event
router.get('/event-participants/:eventId', getEventParticipantsByEventId);

router.get('/payment-details',getPaymentDetails)

router.get('/payment-details-excel',getPaymentDetailsExcel)

router.get('/event-participation-excel',exportEventParticipants)

router.get('/department-analytics', exportDepartmentData);
router.get('/event-participation', exportEventParticipation);

module.exports = router;
