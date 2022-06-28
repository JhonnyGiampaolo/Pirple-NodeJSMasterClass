/*
 * Server-related tasks
 *
 */

//Dependencies
const http = require ('http');
const https = require ('https');
const url = require ('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require ('./config');
const fs = require ('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

// Instantiate the server module object
var server = {};

// @TODO GWET RID OF THIS
//helpers.sendTwilioSMS('4158375309','Hello!',function(err){
//    console.log('this was the error',err);
//})

// Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
    server.unifiedServer(req,res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key'  : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res){
    unifiedServer(req,res);
});

//  all the server logic for both the http and the https server
server.unifiedServer = function(req, res){
    // Get the URL and parse it
    var parsedURL = url.parse(req.url,true);

    // Get the path
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedURL.query;

    // Get the HTTP Method
    var method = req.method.toLowerCase();

    // Get the header as an object
    var headers = req.headers;

    //Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',function(data){
        buffer += decoder.write(data);
    });
    req.on('end',function(){
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found use the notFound handler
            var choosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        choosenHandler(data, function(statusCode,payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload ti a string
            var payloadString = JSON.stringify(payload);

            //Return the response
            res.setHeader('Content_Type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

                    // Log the request path
        console.log("Request received on path: "+trimmedPath+" whir this method: "+method+" with this query string parameters ",queryStringObject);
        console.log("Request received with these headers ", headers);
        console.log("Request received with this payloads ", buffer);
        console.log("Returning this response: ", statusCode, payloadString)

        });
    });
};

// Define a request router
server.router = {
    'ping'  : handlers.ping,
    'users' : handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};

// Init script
server.init = function(){
    // Start the server
    server.httpServer.listen(config.httpPort,function(){
        console.log("the server is listening on port "+config.httpPort);
    });
    
    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort,function(){
        console.log("the server is listening on port "+config.httpsPort);
    });

}

// Export the module
module.exports = server;