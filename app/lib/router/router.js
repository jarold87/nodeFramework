var bodyParser = require('body-parser');

module.exports = {

    lupus: require('lupus'),
    path: require("path"),
    async: require('async'),

    file: require(__dirname + '/../service/file/file.js'),

    serverData: {},
    container: null,
    dependencyInjections: null,
    controllers: null,
    middlewares: null,

    createRouting: function(serverData, container, callback) {

        var that = this;
        that.serverData = serverData;
        that.container = container;

        that.async.waterfall([
            function (callback) {
                that.loadDependencyInjections(function(dependencyInjections) {
                    that.dependencyInjections = dependencyInjections;
                    that.container.Create.setDependencyInjections(dependencyInjections);
                    callback();
                })
            },
            function (callback) {
                that.loadMiddlewares((middlewares) => {
                    that.middlewares = middlewares;
                    callback();
                });
            },
            function (callback) {
                that.bindMiddlewares(callback);
            },
            function (callback) {
                that.loadControllers(function(controllers) {
                    that.controllers = Object.keys(controllers);
                    that.container.Create.setControllers(controllers);
                    callback();
                })
            },
            function(callback) {
                that.loadHandlers(function () {
                    callback();
                })
            }
        ], function() {
            callback();
        });

    },


    getDependencyInjections: function() {

        return this.dependencyInjections;

    },

    getControllers: function() {

        return this.controllers;

    },

    loadDependencyInjections: function(callback) {

        var that = this;
        var dependencyInjection = [];
        var srcDir = that.fullPath('src');
        that.file.searchFiles(srcDir, 'dependencyInjection', function(files) {
            that.lupus(0, Object.keys(files).length, function(i) {
                require(files[i].path)(
                    that.container.Public
                );
                var pN = that.getPackageName(files[i].path, 'dependencyInjection');
                dependencyInjection.push(pN + '/' + files[i].name);
            }, function() {
                callback(dependencyInjection);
            });
        });

    },

    loadMiddlewares: function(callback) {
        var middlewares = {};
        var srcDir = this.fullPath('src');
        this.file.searchFiles(srcDir, 'middleware', (files) => {
            this.lupus(0, Object.keys(files).length, (i) => {
                let middleware = require(files[i].path)(this.container.Public);
                let packageName = this.getPackageName(files[i].path, 'middleware');
                middlewares[packageName + '/' + files[i].name] = middleware;
            }, () => callback(middlewares));
        });
    },

    bindMiddlewares: function (callback) {
        var middlewareConfig = require(this.fullPath('app/config/middleware.json'));
        var routes = Object.keys(middlewareConfig);

        this.async.eachSeries(routes, (route, routeCallback) => {
            var middlewares = middlewareConfig[route];
            this.async.eachSeries(middlewares, (middleware, middlewareCallback) => {
                var actualMiddleware = this.middlewares[middleware + '.js'];
                this.serverData.app.use('/' + route, actualMiddleware);
                middlewareCallback();
            }, routeCallback);
        }, callback);
    },

    loadControllers: function(callback) {

        var that = this;
        var controllers = {};
        var srcDir = that.fullPath('src');
        that.file.searchFiles(srcDir, 'controller', function(files) {
            that.lupus(0, Object.keys(files).length, function(i) {
                var object = require(files[i].path)(
                    that.container.Public
                );
                var pN = that.getPackageName(files[i].path, 'controller');
                controllers[pN + '/' + files[i].name] = object;
            }, function() {
                callback(controllers);
            });
        });

    },

    loadHandlers: function (callback) {

        var that = this;
        var routingConfig = require(that.fullPath('app/config/routing.json'));
        var keys = Object.keys(routingConfig);
        that.lupus(0, keys.length, function(i) {
            var path = keys[i];
            var controller = routingConfig[path].split('::')[0];
            var method = routingConfig[path].split('::')[1];
            if (
                that.container.Create.getController(controller + '.js')
                && Object.keys(that.container.Create.getController(controller + '.js')).indexOf(method) > -1
            ) {
                var handler = that.container.Property.controllers[controller + '.js'][method];
                that.serverData.app.all('/' + path, bodyParser.json(), handler);
            } else {
                console.log('No route: ' + path + ' -> ' + routingConfig[path] );
            }
        }, function() {
            callback();
        });

    },

    getPackageName: function(file, subDir) {

        var that = this;
        var norm = that.path.normalize(file);
        norm = norm.replace(/\\/g, "/").replace('//', '/');
        var tags = norm.split('/');
        var index = tags.indexOf(subDir);
        return tags[index - 1];

    },

    fullPath: function(dir) {

        return this.path.join(this.serverData.cwd, dir);

    }

};