/*
 * Helpers for various tasks
 *
 */

// Dependencies
var crypto = require('crypto');
const { callbackify } = require('util');
var config  = require('./config');

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
// Export the module
module.exports = helpers;