module.exports = function (container) {

    var Mongo = {
        client: container.Private.requireAppService('mongo/client'),
        repository: container.Private.requireAppService('mongo/repository')
    };

    return {
        name: 'mongo',
        service: Mongo
    }

};