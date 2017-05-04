module.exports = function (container) {

    var Response = container.getService('app/response');
    Response.setConfig(container.getConfig('app/response'));

};