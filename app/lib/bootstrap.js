module.exports = {

    container: require(__dirname + '/container/container.js'),
    router: require(__dirname + '/router/router.js'),
    serverData: {},

    setServerData: function(data) {
        this.serverData = data;
    },

    bootServer: function(callback) {

        var that = this;
        that.container.createContainer(that.serverData, function(container) {
            that.router.createRouting(that.serverData, container, function() {
                callback();
            })
        });

    },

    bootChildProcess: function(callback) {

        var that = this;
        that.container.createContainer(that.serverData, function(container) {
            callback(container.Public);
        });

    },

    getServices: function() {

        return this.container.getServices();

    },

    getDependencyInjections: function() {

        return this.router.getDependencyInjections();

    },

    getControllers: function() {

        return this.router.getControllers();

    }

};