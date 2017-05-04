module.exports = function (container) {

    var File = container.Private.requireAppService('file/file');

    return {
        name: 'file',
        service: File
    }

};