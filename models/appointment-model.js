const  mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    professor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    slot: { 
        type: String, 
        required: [true, 'Appointment slot is required'] 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Apointment',appointmentSchema)