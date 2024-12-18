const Availability = require('../models/availability-model')
const Appointment = require('../models/appointment-model')

async function availabilityProfessor(req,res){
    try{

        if(req.user.role !== 'professor'){
            return res.status(403).json({
                error:'Forbidden access',
                message:'Only professors can access this route'
            })
        }

        const {slots} = req.body

        if(!slots || !Array.isArray(slots)){
            return res.status(400).json({
                error:'Invalid input',
                message:'Must be in a proper format of array of slots'
            })
        }

        const uniqueSlots = [...new Set(slots)];
        if (uniqueSlots.length > 10) {
            return res.status(400).json({
                error: 'Too Many Slots',
                message: 'Maximum of 10 unique time slots allowed'
            });
        }

        const availability = await Availability.findOneAndUpdate(
            { professor: req.user._id },
            { 
                professor: req.user._id, 
                slots: uniqueSlots 
            },
            { 
                upsert: true, 
                new: true,
                runValidators: true 
            }
        );


        res.status(200).json({
            message: 'Availability updated successfully',
            availability: {
                totalSlots: availability.slots.length,
                slots: availability.slots
            }})
    }
    catch(err){
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to update availability',
            details: err.message
        });
    }
}

async function availabilityCheckStudent(req,res){
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only students can view professor availability'
            });
        }

        const availability = await Availability.findOne({ 
            professor: req.params.professorId 
        });

        if (!availability || availability.slots.length === 0) {
            return res.status(404).json({
                error: 'No Availability',
                message: 'This professor has no available time slots'
            });
        }

        res.status(200).json({
            professorId: req.params.professorId,
            availableSlots: availability.slots
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve availability',
            details: error.message
        });
    }
}

async function bookAppointments(req,res){
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only students can book appointments'
            });
        }

        const { professorId, slot } = req.body;

        
        if (!professorId || !slot) {
            return res.status(400).json({
                error: 'Invalid Input',
                message: 'Professor ID and slot are required'
            });
        }

    
        const availability = await Availability.findOne({ professor: professorId });
        if (!availability || !availability.slots.includes(slot)) {
            return res.status(400).json({
                error: 'Slot Unavailable',
                message: 'Selected time slot is not available'
            });
        }

        
        const existingAppointment = await Appointment.findOne({ 
            professor: professorId, 
            slot: slot 
        });
        if (existingAppointment) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'This slot has already been booked'
            });
        }

   
        const appointment = new Appointment({ 
            professor: professorId, 
            student: req.user._id, 
            slot 
        });
        await appointment.save();

        availability.slots = availability.slots.filter(s => s !== slot);
        await availability.save();

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: {
                id: appointment._id,
                professor: professorId,
                slot: slot
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to book appointment',
            details: error.message
        });
    }
}

async function deleteAppointment(req,res){
    try {
        if (req.user.role !== 'professor') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only professors can cancel appointments'
            });
        }


        const appointment = await Appointment.findById(req.params.appointmentId);
        
     
        if (!appointment || appointment.professor.toString() !== req.user._id) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Appointment not found or you are not authorized to cancel'
            });
        }

      
        const availability = await Availability.findOne({ professor: req.user._id });
        
  
        if (availability) {
            availability.slots.push(appointment.slot);
            await availability.save();
        }

    
        await appointment.deleteOne();

        res.status(200).json({
            message: 'Appointment canceled successfully',
            appointmentId: req.params.appointmentId
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to cancel appointment',
            details: error.message
        });
    }
}

async function viewAppointments(req,res){
    try {
        const query = req.user.role === 'student' 
            ? { student: req.user._id } 
            : { professor: req.user._id };

        const appointments = await Appointment.find(query)
            .populate('professor student', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            totalAppointments: appointments.length,
            appointments: appointments.map(appt => ({
                id: appt._id,
                professor: {
                    id: appt.professor._id,
                    name: appt.professor.name
                },
                student: {
                    id: appt.student._id,
                    name: appt.student.name
                },
                slot: appt.slot,
                createdAt: appt.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            error: 'Server Error',
            message: 'Failed to retrieve appointments',
            details: error.message
        });
    }
}

module.exports = {
    availabilityProfessor,availabilityCheckStudent,bookAppointments,
    deleteAppointment,viewAppointments
}