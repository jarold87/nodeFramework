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
    server.bootstrap.bootServer(function() {
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

};

module.exports = Server;