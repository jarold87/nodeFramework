module.exports = function (container) {

    var Response = container.getService('app/response');

    var mongodbClient = container.getService('mongo').client;
    var mongoDbConfig = container.getConfig('mongo');

    container.getService('auth').setPublic('^/app/db$');

    var Public = {
        
        test: function (request, response) {

            Private.runDbTest(function(r) {
                if (r) {
                    Response.sendOk(response);
                    return;
                }
                Response.unSuccess(response);
            });
            
        }

    };

    var Private = {

        runDbTest: function (callback) {

            var client = new mongodbClient(mongoDbConfig, '');
            client.getConnection(function(err, db) {
                if (err) {
                    return callback(false);
                }
                callback(true);
            });

        }

    };

    return Public;

};