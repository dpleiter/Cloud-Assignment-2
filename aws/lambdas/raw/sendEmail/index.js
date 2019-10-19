// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

var aws = require('aws-sdk');
var ses = new aws.SES();
const {Client} = require('./node_modules/pg/');

exports.handler = (event, context, callback) => {
    const client = new Client({
        user: 'dylan',
        host: '[REMOVED]',
        database: '[REMOVED]',
        password: '[REMOVED]',
        port: 5432
    });
    
    client.connect();

    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    const eventData = JSON.parse(event.body);
    
    client
        .query(`INSERT INTO Permissions VALUES ('${eventData.mapid}', '${eventData.emailAddress}');`)
        .then(result => {
           client.end(); 
        });
    
    
    var params = {
        Destination: {
            ToAddresses: [eventData.emailAddress]
        },
        Message: {
            Body: {
                Text: {
                    Data: `You have been invited to collaborate on a map by ${username}. Please log in at www.amenity-mapper.com to access.`
                }
                
            },
            
            Subject: { 
                Data: "Amenity Mapper - Invitation to Collaborate"
            }
        },
        Source: "pleiterd@gmail.com"
    };
    
    
    
     ses.sendEmail(params, function (err, data) {
            callback(null, {
                statusCode: 201,
                body: JSON.stringify({test1: "lalala"}),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            });
        if (err) {
            console.log(err);
            context.fail(err);
        } else {
            console.log(data);
            context.succeed(event);
        }
    });
};