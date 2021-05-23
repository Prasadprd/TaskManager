const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const { setupDatabase,userOne,userOneId } = require('./fixtures/db')



beforeEach(setupDatabase)

test('Should sign up a new user',async()=>{
    const response=await request(app).post('/users').send({
        name :'Prasad',
        email:'prasadchaudhari117@gmail.com',
        password :'prasad117'
    }).expect(201)

    //Asserting the database to check whether the user added in database or not
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Asserting the user by properties
    expect(response.body).toMatchObject({
        user :{
            name:'Prasad',
            email:'prasadchaudhari117@gmail.com'
        },
        token : user.tokens[0].token
    })

    //Asserting the password
    expect(user.password).not.toBe('prasad117')
})

test('Should login an existing user',async()=>{
    const response =await request(app).post('/users/login').send({
        email: userOne.email,
        password : userOne.password
    }).expect(200)

    //Asserting the user in database
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)

})

test('should not login with bad credentials',async()=>{
    await request(app).post('/users/login').send({
        email :'prasad117@gmail.com',
        password:'prasaddfa'
    }).expect(400)
})

test('Should get profile of an authenticated user',async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile of unauthenticated user',async()=>{
    await request(app)
        .get('/users/me')
        //.set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should delete account for user',async()=>{
    const response=await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user',async()=>{
    await request(app)
        .delete('/users/me')
        .send()
        .expect(404)
})

test('Should update avatar of user',async()=>{
    await request(app)
        .post('/users/me/avtar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('Avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            name :'Puke Skywalker'
        }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Puke Skywalker')
})

test('Should not update invalid user field',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send({
            location : 'Savda'
        }).expect(400)
})