module.exports = {

    lupus: require('lupus'),
    path: require("path"),
    async: require('async'),

    file: require('file-service/file.js'),
    config: require(__dirname + '/config.js'),
    service: require(__dirname + '/service.js'),
    container: require(__dirname + '/obj/container.js'),

    serverData: {},

    createContainer: function(serverData, callback) {

        var that = this;
        that.serverData = serverData;

        that.async.waterfall([

            function (callback) {
                that.config.loadConfigs(that.serverData, function(Config) {
                    that.container.Create.setConfigs(Config);
                    callback();
                });
            },
            function (callback) {
                that.setContainerWithServerData(function() { callback() });
            },
            function (callback) {
                that.service.loadSrcServices(that.container, function(services) {
                    that.container.Create.setServices(services);
                    callback();
                })
            },
            function (callback) {
                that.service.loadAndAddAppServices(that.container, function() { callback() });
            }

        ], function() {

            callback(that.container);

        });

    },

    getServices: function() {

        return this.container.Property.services.list();

    },

    setContainerWithServerData: function(callback) {

        var that = this;
        that.container.Create.setCwd(that.serverData.cwd);
        that.container.Create.setApp(that.serverData.app);
        that.container.Create.setEnv(that.serverData.env);
        that.container.Create.setPort(that.serverData.port);
        that.container.Create.setStartServerDate(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
        callback();

    }

};