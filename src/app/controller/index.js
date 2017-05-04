module.exports = function (container) {

    var bodyParser = require('body-parser');

    var app = container.getApp();
    var Response = container.getService('app/response');
    var Time = container.getService('time');

    var Public = {

        showInfo: function(request, response) {
            var info = Private.getInfo();
            Response.setHeader(response);
            response.send(info);
            response.end();
        }

    };

    var Private = {

        getInfo: function() {
            return {
                version: process.versions,
                time: Time.getNowToString(),
                server: container.getInfo(),
                cpus: require('os').cpus().length,
                serverTimeZone: Time.serverTimeZone,
                outTimeZone: Time.outTimeZone

            };
        }

    };

    return Public;

};