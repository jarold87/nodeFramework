module.exports = function (container) {

    var HttpService = container.Private.requireAppService('http/httpService');
    var Response = container.Private.requireAppService('http/response');
    var Options = container.Private.requireAppService('http/options');
    HttpService.setResponse(Response);
    HttpService.setOptions(Options);

    return {
        name: 'http',
        service: HttpService
    }

};