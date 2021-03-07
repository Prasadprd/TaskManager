const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/users')
const router = express.Router()
const sharp = require('sharp')

const multer= require('multer')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')




// Creating a user
router.post('/users', async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token =await user.generateToken()  //Generating a token for authentication
        res.status(201).send({ user , token})
    }catch (e){
        res.status(400).send(e)
    }
    
})

// Login a user
router.post('/users/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()        //Generating a token
        res.send({user,token})

    } catch (e) {
        res.status(400).send()
    }
})

//Logout user 
router.post('/users/logout',auth, async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(404).send()
    }
})

// Logout all Id's of same user
router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens= []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// Reading a user
router.get('/users/me',auth,async (req,res)=>{
    
    try{
        res.send(req.user)
    }catch(e){
        res.status(404).send(e)
    }
    
    
})

// Uploading a profile pic
const upload = multer({
    limits :{
        fileSize : 1000000
    },
    fileFilter(req ,file ,cb){
        if(!file.originalname.match(/\.(jpg|jpej|png)$/)){
            return cb(new Error('Please upload a valid Image'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avtar',auth,upload.single('Avatar'),async (req,res)=>{
    const buffer =await sharp(req.file.buffer).resize({width:250 ,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('Good job')
},(error,req,res,next)=>{
    res.send({'error' :error.message})
}) 


// Deleting profile pic
router.delete('/users/me/avatar',auth,async(req , res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send('Pic deleted')
})

// Readin Avatar
router.get('/users/:id/avatar',async(req,res)=>{
    const user =await User.findById(req.params.id)
    if(!user || !user.avatar){
        throw new Error('sd')
    }
    res.set('Content-Type','image/png')
    res.send(user.avatar)
})

// // Reading a user by id
// router.get('/users/:id', async (req,res)=>{
//     const _id = req.params.id

//     try{
//         const user =await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.status(200).send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
    
// })

// Updating the user  by id
router.patch('/users/me',auth, async(req,res)=>{
    
    const updates = Object.keys(req.body)
    const allowedUpdates =['name','email','age','password']
    const isValidOption= updates.every((update)=> allowedUpdates.includes(update))
    
    if(!isValidOption){
        return res.status(400).send('Invalid Updates')
    }

    try{
        
        
        updates.forEach((update)=>req.user[update]= req.body[update] )
        await req.user.save()

        //const user =await User.findByIdAndUpdate(_id, req.body, {new : true,runValidators : true})
        if(!req.user){
            return res.status(400).send()
        }
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

// Deleting a user by id
router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        sendCancellationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
    
})


module.exports = router