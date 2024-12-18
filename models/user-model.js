const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        match: [/\S+@\S+\.\S+/,'Invalid email format']
    },
    password:{
        type:String,
        required:true,
        minlength:[6,'Password must be atleast 6 characters long']
    },
    role:{
        type:String,
        enum:{
            values:['student','professor'],
            message:'Role can be student or professor'
        },
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model('User',userSchema);