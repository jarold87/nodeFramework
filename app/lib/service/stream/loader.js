module.exports = function (container) {

    var Service = container.Private.requireAppService('stream/stream');
    var Options = container.Private.requireAppService('stream/options');
    Service.setOptions(Options);

    return {
        name: 'stream',
        service: Service
    }

};