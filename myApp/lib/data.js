/*
* Library for storing and editing data
*
*/

// Dependencies
var fs = require('fs');
var path = require('path');
const helper = require ('./helpers');

// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
lib.create = function(dir, file, data, callback){

    const innerPath = lib.baseDir+dir+'/'+file+'.json';

    // Open the file for writing
    fs.open(innerPath,'wx', function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to string
            var sstringData = JSON.stringify(data);

            // Write to file and close it
            fs.writeFile(fileDescriptor, sstringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        } else {
                            callback('Error closing new file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
lib.read = function(dir, file, callback){

    const innerPath = lib.baseDir+dir+'/'+file+'.json';

    fs.readFile(innerPath,'utf8',function(err,data){
        if(!err && data){
            const parsedData = helper.parseJsonToObject(data);
            callback(false,parsedData);
        } else {
            callback(err,data);
        }
    });
};

// Update data inside a file
lib.update = function(dir, file, data, callback){
    const innerPath = lib.baseDir+dir+'/'+file+'.json';

    // Open the file for writing
    fs.open(innerPath,'r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to string
            const stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    // Write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false)
                                } else {
                                    callback('Error closing the file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }
    });
};

// Delete a file
lib.delete = function(dir,file,callback){
    const innerPath = lib.baseDir+dir+'/'+file+'.json';

    // Unlink the file
    fs.unlink(innerPath,function(err){
        if(!err){
            callback(false);
        } else {
            callback('Error deleting the file')
        }
    });
};

// Esport the module
module.exports = lib;