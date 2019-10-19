const {Client} = require('./node_modules/pg/');

exports.handler = (event, context, callback) => {
    const client = new Client({
        user: 'dylan',
        host: '[REMOVED]',
        database: '[REMOVED]',
        password: '[REMOVED]',
        port: 5432
    });

    const username = event.requestContext.authorizer.claims['cognito:username'];
    
    const query = `SELECT *
                   FROM Markers NATURAL JOIN MarkerTypes
                   WHERE MapID IN (
	                   SELECT MapId
	                   FROM Permissions
	                   WHERE UserID = '${username}');`;

    client.connect();

    client
        .query(query)
        .then(result => {
            callback(null, {
                statusCode: 201,
                body: JSON.stringify(result.rows),
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