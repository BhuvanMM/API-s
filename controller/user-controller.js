const User = require('../models/user-model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function register(req,res){
    try{
        const {name,email,password,role} = req.body

        const alreadyUser = await User.findOne({email})
        if(alreadyUser){
            return res.status(400).json({
                error:'Registration Failed',
                message:'Email already taken'
            })
        }

        const pass = await bcrypt.hash(password,10)
        const user = new User({
            name,
            email,
            password:pass,
            role
        })

        await user.save()
        res.status(201).json({
            message:'User registered successfully',
            userId:user._id
        })

    }
    catch(err){
        res.status(500).json({
            error: 'Registration Error',
            message: err.message
        });
    }
}

async function login(req,res){
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({
                error:'user not found',
                message:'This user is not registered'
            })
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({
                error: 'Login Failed',
                message: 'Incorrect password'
            });
        }

        const token = jwt.sign(
            { _id: user._id, role: user.role }, 
            process.env.JWT_SECRET
        );

        res.header('Authorization', token).json({
            message: 'Login successful',
            token,
            role: user.role
        });
    }
    catch(err){
        res.status(400).json({
            error:'Failed to login',
            message:err.message
        })
    }
}


module.exports={
    register,login
}