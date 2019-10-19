const {Client} = require('./node_modules/pg/');

exports.handler = (event, context, callback) => {
    const client = new Client({
        user: 'dylan',
        host: '[REMOVED]',
        database: '[REMOVED]',
        password: '[REMOVED]',
        port: 5432
    });

    const username = event.request.userAttributes.email;
    
    const query = `INSERT INTO Users VALUES ('${username}', NOW(), NULL);`;

    client.connect();

    client
        .query(query)
        .then(result => {
            callback(null, event);
            client.end();
        })
        .catch((err) => {
            console.error(err);
            callback({statusCode: 400}, event);
            client.end();
        });
};