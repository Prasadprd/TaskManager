 const mongodb = require('mongodb')
 
 //Create a mongodb client
 const MongoClient = mongodb.MongoClient

 //create a localhost URL with mongodb port number
 const connectionURL = 'mongodb://127.0.0.1:27017'

 const databaseName = 'task-manager'

 // Connecting to the database to perform CRUD operations
MongoClient.connect(connectionURL,{useNewUrlParser : true,useUnifiedTopology: true},(error,client)=>{
    if(error){
        return console.log('Unable to connect to the database')
    }
    console.log('connected to database')
    const db = client.db(databaseName)
    db.collection('task').findOne({_id :new mongodb.ObjectID("601e658dc0b8e421844c9a4b")},(error,result)=>{
        console.log(result)
    })
    db.collection('task').find({status : "Incomplete"}).toArray((error,result)=>{
        console.log(result)
    })
})