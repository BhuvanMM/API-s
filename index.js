require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const userRoute = require('./routes/user-routes')
const appointmentRoute = require('./routes/appointment-route')

const app = express()
const PORT = process.env.PORT || 3000


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json())

mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log('connected to database'))
.catch((err)=> console.log('Failed to connect to database',err))


app.use('/user',userRoute)
app.use('/app',appointmentRoute)

app.listen(PORT,()=>{
    console.log(`server running at port ${PORT}`)  
})