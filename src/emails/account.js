const sgMail = require('@sendgrid/mail')

const sendgridApiKey = process.env.SENDGRID_API_KEY 

sgMail.setApiKey(sendgridApiKey)

const sendWelcomeEmail =(email, name)=>{
    sgMail.send({
        to:email,
        from :'prasadchaudhari117@gmail.com',
        subject :'Thanks for joining us',
        text : `Welcome ${name},We are at your service`        
    })
}

const sendCancellationEmail=(email, name)=>{
    sgMail.send({
        to:email,
        from :'prasadchaudhari117@gmail.com',
        subject :'Let us know what we did wrong',
        text :`Hello ${name},Let us know if we can do something to have you aboard with us`
    
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancellationEmail
}