module.exports = function (container) {

    var Time = container.Private.requireAppService('time/time');
    var Config = container.Public.getConfig('base');
    Time.serverTimeZone = Config.serverTimeZone;
    Time.outTimeZone = Config.outTimeZone;

    return {
        name: 'time',
        service: Time
    }

};