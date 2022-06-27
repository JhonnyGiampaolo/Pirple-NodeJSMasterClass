/*
 * Helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto');
var config  = require('./config');
var https = require('https');
var querystring = require('querystring');
// Containers for helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

// Parse a Json string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
    try {
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
} 

// Create a string of random alphanumeric charaters, of a given lenght
helpers.createRandomString = function(strLenght){
    strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
    if (strLenght){
        // Define all the posssible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmneopqrstuvwxyz0123456789';

        // Start the final string
        var str = '';
        for(i=1; i <= strLenght; i++){
            // Get a random character from the posssibleCharaters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // Append this character to the final string
            str+=randomCharacter;
        }

        // Return the final string
        return str;
    } else {
        return false
    }
}

// Send an SMS message via Twilio
helpers.sendTwilioSMS = function(phone,msg,callback){
    // Validate parameters
    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
    if (phone && msg){
        // Configure the request payload
        var payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+57'+phone,
            'Body' : msg
        };
        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        // Configure the request details
        var requestDetails = {
            'protocol':'https:',
            'hostname':'api.twilio.com',
            'method':'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'header':{
                'Content-Type':'application/x-www-form-urlencoded',
                'Content-Lenght': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails,function(res){
            // Grab the status of the sent request
            var status = res.statusCode;
            // Callback successfully if the request went through
            if(status == 200 || status == 201){
                callback(false);
            } else {
                callback('Status code returned was '+status);
            }
        });
        // Bind ti the error event so it doesn't get thrown
        req.on('error',function(e){
            callback(e);
        })

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters were misssing or invalid')
    }
};
// Export the module
module.exports = helpers;