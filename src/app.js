
const express = require('express')
const userRouter = require('./router/user-router')
const taskRouter = require('./router/task-router')
require('../src/db/mongoose')
//require("../mongodb")

const app = express()


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app