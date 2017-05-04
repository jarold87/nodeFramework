module.exports = function (container) {

    var Service = container.Private.requireAppService('auth/auth');
    var Config = container.Public.getConfig('auth');
    Service.setConfig(Config);

    // Only at main process
    if (container.Public.getApp()) {
        var app = container.Public.getApp();
        app.use(Service.use);
    }

    return {
        name: 'auth',
        service: Service
    }

};