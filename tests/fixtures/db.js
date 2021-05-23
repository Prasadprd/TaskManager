const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/users')
const Task = require('../../src/models/task')


const userOneId = new mongoose.Types.ObjectId

const userOne ={
    _id : userOneId,
    email :'Luke@gmail.com',
    name :'Luke Skywalker',
    password: 'starwars',
    tokens : [{
        token: jwt.sign({_id:userOneId},process.env.JWT_SECRET)
    }]
}


const userTwoId = new mongoose.Types.ObjectId

const userTwo ={
    _id : userTwoId,
    email :'Ross@unagi.com',
    name :'Ross Gellar',
    password: 'imfine!',
    tokens : [{
        token: jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id : new mongoose.Types.ObjectId,
    description :' Luke\'s first task',
    completed : true,
    owner : userOne._id
}
const taskTwo = {
    _id : new mongoose.Types.ObjectId,
    description :' Luke\'s second task',
    completed : false,
    owner : userOne._id
}
const taskThree = {
    _id : new mongoose.Types.ObjectId,
    description :' Ross\'s first task',
    completed : true,
    owner : userTwo._id
}
const setupDatabase =async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports ={
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,taskTwo,taskThree,
    setupDatabase
}