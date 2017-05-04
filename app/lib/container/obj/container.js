var Container = {};
var path = require('path');
var cp = require('child_process');

Container.Property = {

    app: {},
    env: null,
    port: null,
    configs: {},
    services: {},
    controllers: [],
    dependencyInjections: [],
    startServerDate: null

};

Container.Create = {

    setApp: function(app) {
        Container.Property.app = app;
    },

    setEnv: function(env) {
        Container.Property.env = env;
    },

    setPort: function(port) {
        Container.Property.port = port;
    },

    setConfigs: function(configs) {
        Container.Property.configs = configs;
    },

    setServices: function(services) {
        Container.Property.services = services;
    },

    addService: function(name, service) {
        Container.Property.services.set(name, service);
    },

    setControllers: function(controllers) {
        Container.Property.controllers = controllers;
    },

    setDependencyInjections: function(dependencyInjection) {
        Container.Property.dependencyInjections = dependencyInjection;
    },

    setCwd: function(cwd) {
        Container.Property.configs.get('dir').cwd = cwd;
    },

    setStartServerDate: function(date) {
        Container.Property.startServerDate = date;
    },

    getController: function (controller) {
        return Container.Property.controllers[controller];
    }

};

Container.Private = {

    getAppServiceFilePath: function(name) {
        return Container.Property.configs.get('dir').cwd + '/'
        + Container.Property.configs.get('dir').appService + '/'
        + name
    },

    requireAppService: function(name) {
        return require(Container.Property.configs.get('dir').cwd + '/'
        + Container.Property.configs.get('dir').appService + '/'
        + name);
    }

};

Container.Public = {

    getApp: function() {
        return Container.Property.app;
    },

    getEnv: function() {
        return Container.Property.env;
    },

    getPort: function() {
        return Container.Property.port;
    },

    getConfig: function(name) {
        return Container.Property.configs.get(name);
    },

    getService: function(name) {
        return Container.Property.services.get(name);
    },

    getDir: function(name) {
        if (name == 'cwd') {
            return Container.Property.configs.get('dir').cwd;
        }
        var file = Container.Property.configs.get('dir').cwd + '/' + Container.Property.configs.get('dir')[name];
        var norm = path.normalize(file);
        norm = norm.replace(/\\/g, "/").replace('//', '/');
        return norm;
    },

    require: function(name) {
        return require(Container.Public.getDir('src') + '/' + name);
    },

    getPath: function(name) {
        return Container.Public.getDir('src') + '/' + name;
    },

    getInfo: function() {
        return {
            cwd: Container.Property.configs.get('dir').cwd,
            start: Container.Property.startServerDate,
            configs: Container.Property.configs.list(),
            services: Container.Property.services.list(),
            dependencyInjections: Container.Property.dependencyInjections,
            controllers: Container.Property.controllers
        }
    }

};

Object.preventExtensions(Container.Public);

module.exports = Container;