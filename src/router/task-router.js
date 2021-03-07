const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const router = express.Router()

// Creating a task
router.post('/tasks', auth,async (req,res)=>{
    const task = new Task({
        ...req.body,
        owner :req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)

    }catch(e){
        res.status(400).send(e)
    }
})
 
// Reading all task from database
router.get('/tasks',auth, async (req,res)=>{
    const match ={}
    const sort ={}

    if(req.query.completed){
        match.completed =req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 :1
    }
    try{
        //const tasks= await Task.find({owner : req.user.id,completed : match.completed})
        await req.user.populate({
            path : 'tasks',
            match ,
            options :{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort 
            }
        }).execPopulate()
        res.send(req.user.tasks )
    }catch(e){
        res.status(500).send(e)
    }
    
})

// Reading task by id
router.get('/tasks/:id',auth, async (req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id,owner :req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

// Updating Task by id
router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['task','completed']
    const isValidOption = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOption){
        return res.status(404).send('Invalid Updates')
    }
    try{
        
        const task = await Task.find({_id: req.params.id,owner : req.user._id })
        //const task = await Task.findByIdAndUpdate(req.params.id , req.body, {new : true,runValidators : true})
        if(!task){
            return res.status(400).send()
        }
        updates.forEach((update)=> task[update]=req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
    
})

// Deleting task by id
router.delete('/tasks/:id',auth,async(req,res)=>{
    try{
        const task = await Task.findByIdAndDelete({_id : req.params.id , owner : req.user._id})
        if(!task){
            res.status(404).send('task not found')
        }
        res.send(task)
    }catch(e){
        res.status(404).send(e)
    }
})

module.exports = router