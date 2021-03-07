const { json } = require('express')
const express = require('express')
const Task = require('./models/task')
const User = require('./models/users')
const userRouter = require('./router/user-router')
const taskRouter = require('./router/task-router')
require('../src/db/mongoose')


const app = express()
const port = process.env.PORT
console.log(process.env.PORT)

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
console.log('Hello')


app.listen(port, ()=>{
    console.log('Server is up on port',port)
})