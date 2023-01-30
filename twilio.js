

const express = require('express')
// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure

const accountSid = "AC0458506faff3359107ae6603c1deb809";
const authToken = "9d8cf5ac00a840d62212b5f838bdb77a";
const verifySid = "VA3b252c0c74d84ecce9f8f60176038e3f";
const client = require("twilio")(accountSid, authToken);
module.exports={
  sentotp :(number) =>{
    console.log('wert')
    client.verify.v2 
  .services(verifySid)
  .verifications.create({ to: `+91 ${number} `, channel: "sms" })
 },
    check: async (otpCode,number) => {
          try{
    const status = await client.verify.v2
              .services(verifySid)
              .verificationChecks.create({ to: `+91 ${number}`, code: otpCode });
               return status
          }catch(err){
              console.log(err);
          }   
      }
    }
