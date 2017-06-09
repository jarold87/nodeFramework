/**
 * @param config
 * @param databaseName
 * @constructor
 */
function MongoDbClient (config, databaseName) {

    this.mongo = require('mongodb');

    this.config = config;
    this.databaseName = databaseName;
    this.client = null;
}

MongoDbClient.prototype = {

    getConnection: function (callback) {
        var url = 'mongodb://' + this.config.host + ':' + this.config.port
            + '/' + this.databaseName;
        if (!this.client) {
            this.client = this.mongo.MongoClient;
        }
        this.client.connect(url, function (err, db) {
            if (err) {
                try { db.close(); } catch (err) {}
                console.error(new Date().toISOString() + ' MongoDb get connection error (' + db + ')');
                return callback(err, null);
            }
            callback(err, db);
        });
    }

};

module.exports = MongoDbClient;
