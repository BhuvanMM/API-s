const mongoose = require('mongoose')

const availableSchema = new mongoose.Schema({
    professor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    slots:{
        type:[String],
        validate:{
            validator:function(v){
                return v.length <= 10
            },
            message:'Maximum 10 slots are allowed!'
        }
    }
})

module.exports = mongoose.model('Available',availableSchema)