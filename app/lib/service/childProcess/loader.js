module.exports = function (container) {

    var cp = container.Private.requireAppService('childProcess/childProcessHandler');
    cp.Create.setEnv(container.Public.getEnv());
    cp.Create.setPort(container.Public.getPort());
    cp.Create.setChildWorker(container.Private.getAppServiceFilePath('childProcess/childWorker'));
    cp.Create.setBootstrapScript(container.Public.getDir('app') + '/lib/bootstrap');

    return {
        name: 'childProcess',
        service: cp.Public
    }

};