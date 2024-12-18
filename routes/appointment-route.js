const express = require('express')
const authMiddleware = require('../auth/middleware')
const { availabilityProfessor, availabilityCheckStudent, bookAppointments, deleteAppointment, viewAppointments } = require('../controller/appointment-controller')

const router = express.Router()


router.post('/availability',authMiddleware,availabilityProfessor)
router.get('/availability/:professorId',authMiddleware,availabilityCheckStudent)
router.post('/appointment',authMiddleware,bookAppointments)
router.delete('/appointment/:appointmentId',authMiddleware,deleteAppointment)
router.get('/appointments',authMiddleware,viewAppointments)

module.exports = router