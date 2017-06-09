/**
 * @param env
 * @param port
 * @constructor
 */
function Server(env, port) {

    require('date');

    this.logger = require('morgan');
    this.fs = require("fs");
    this.path = require("path");
    this.express = require('express');
    this.bodyParser = require('body-parser');
    this.app = this.express();

    this.bootstrap = require(__dirname + '/bootstrap.js');
    this.middleware = require(__dirname + '/middleware.js');

    this.env = env;
    this.port = port;

}

Server.prototype.createServer = function() {

    var server = this;
    server.bootstrap.setServerData({
        cwd: server.path.dirname(server.path.dirname(__dirname)),
        env: server.env,
        port: server.port,
        app: server.app
    });
    server.bootstrap.bootServer(()  => {
        this.app.use(this.middleware.handleOnAborted);
        server.setListen();
    });
    
};

Server.prototype.setListen = function() {

    var that = this;
    that.app.listen(that.port, function () {
        var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.log(time + ' | start | env: ' + that.env + '| port: ' + that.port);
        if (that.env == 'dev') {
            console.log('services: ' + that.bootstrap.getServices());
            console.log('dependencyInjections: ' + that.bootstrap.getDependencyInjections());
            console.log('controllers: ' + that.bootstrap.getControllers());
        }
    });
    var dir = that.path.dirname(that.path.dirname(__dirname)) + '/public';
    var compress = require('compression');
    that.app.use('/public', compress());
    that.app.use('/public', that.express.static(dir, { maxAge: 86400000 }));
    // x / 1000ms / 60s / 60m = 24h

};

module.exports = Server;