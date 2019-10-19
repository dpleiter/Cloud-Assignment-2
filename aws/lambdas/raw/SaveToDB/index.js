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
    
    if (eventData.maps.add){
        eventData.maps.add.forEach(test => {
            client.query(`INSERT INTO Maps VALUES ('${test.mapid}', '${test.mapname}', ${test.centerlat}, ${test.centerlng}, ${test.zoom}, DEFAULT, DEFAULT);`);
            client.query(`INSERT INTO Permissions VALUES ('${test.mapid}', '${username}');`);
        });
    }
    
    if (eventData.maps.delete){
        eventData.maps.delete.forEach(test => {
            client.query(`DELETE FROM Permissions WHERE mapid = '${test.mapid}';`);
            client.query(`DELETE FROM Markers WHERE mapid = '${test.mapid}';`);
            client.query(`DELETE FROM Maps WHERE mapid = '${test.mapid}';`);
        });
    }
    
    if (eventData.maps.update){
        eventData.maps.update.forEach(test => {
            client.query(`UPDATE Maps SET Mapname = '${test.mapname}', Centerlat = ${test.centerlat}, Centerlng = ${test.centerlng}, Zoom = ${test.zoom}, Lastedit = NOW() WHERE mapid = '${test.mapid}'`);
        });
    }
    
    eventData.markers.add.forEach(marker => {
      client.query(`INSERT INTO Markers VALUES ('${marker.markerId}', '${marker.mapId}', '${marker.placeType}', '${marker.placeName}', ${marker.placeLat}, ${marker.placeLng});`); 
    });
    
    eventData.markers.delete.forEach(marker => {
      client.query(`DELETE FROM Markers WHERE markerid = '${marker.markerId}';`); 
    });
    
    eventData.markers.update.forEach(marker => {
      client.query(`UPDATE Markers SET placetype = '${marker.placeType}', placename = '${marker.placeName}', placelat = ${marker.placeLat}, placelat = ${marker.placeLng}) WHERE markerid = '${marker.markerId}';`); 
    });
    
    
    
    const query = `SELECT * 
                   FROM Maps;`;

    client
        .query(query)
        .then(result => {
            callback(null, {
                statusCode: 201,
                body: JSON.stringify({test1: "lalala"}),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            });
            
            client.end();
        })
        .catch((err) => {
            console.error(err);
            errorResponse(err.message, context.awsRequestId, callback);
        });
};

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        }
    });
}