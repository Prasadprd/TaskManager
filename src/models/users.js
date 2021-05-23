const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('Jsonwebtoken')
const Task = require('./task')



const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required :true,
        trim : true,

    },
    email :{
        type:String,
        required : true,
        unique : true,
        trim : true,
        lowercase :true,
        validate(value) {
            if(! validator.isEmail(value)){
                throw new Error(' Invalid Email')
            }
        }
    },
    password :{
        type : String,
        required : true,
        trim : true,
        minlength:7,
        validate(value){
            if( value.includes('password') ){
                throw new Error('Invalid Password')
            }
        }
    },
    age:{
        type: Number,
        dafault : 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens :[{
        token : {
            type : String,
            required : true
        }
    }],
    avatar :{
        type : Buffer
    }
},{
    timestamps : true
})

userSchema.virtual('tasks',{
    ref : 'Task',
    localField :'_id',
    foreignField : 'owner'
})

// Creating a method on model 
userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = bcrypt.compare(user.password, password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    console.log('from findByCredentials',user)
    return user

}

// Creating method on User instance
userSchema.methods.generateToken=async function (){
    const user = this
    const token = jwt.sign({ _id : user.id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// Hiding private data like password and tokens
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

// Creating a function which run before saving a user 
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password'))
    user.password = await bcrypt.hash(user.password,8)
    next()
})

// Deleting user's tasks when the user is deleted
userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner : user._id})
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User