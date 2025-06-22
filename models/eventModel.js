const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true
  },
  event_id: {
    type: String,
    required: true,
    unique: true
  },
  event_name: {
    type: String,
    required: true
  },
  event_tagline: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  rules: {
    type: String,
    required: true
  },
  contact_details: {
    type: String,
    required: true
  },
  minTeamCount:{
    type:String
  },
  maxTeamCount:{
    type:String
  },
  event_type: {
    type: String,
    // enum: ['team', 'individual'], // Only allow 'team' or 'individual'
    required: true
  },
  max_registrations: {
    type: Number,
    required: true
  },
  registrations_completed: {
    type: Number,
    default: 0
  },
  whatsapp_link:{
    type:String,
  }
});


// Method to check if registration is available
eventSchema.methods.canRegister = function() {
  return this.registrations_completed < this.max_registrations;
};


// Static method to increment registration count
eventSchema.methods.incrementRegistration = async function() {
  if (this.canRegister()) {
    this.registrations_completed += 1;
    await this.save();
    return true;
  }
  return false;
};


const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
