module.exports = {

    lupus: require('lupus'),
    path: require("path"),
    file: require('file-service/file.js'),
    service: require(__dirname + '/obj/service.js'),

    loadSrcServices: function (container, callback) {

        var that = this;
        var Service = new that.service();
        var srcDir = container.Public.getDir('src');
        that.file.searchFiles(srcDir, 'service', function(files) {
            that.lupus(0, Object.keys(files).length, function(i) {
                var service = require(files[i].path);
                var pN = that.getPackageName(files[i].path, 'service');
                Service.set(pN + '/' + files[i].name, service);
            }, function() {
                callback(Service);
            });
        });

    },


    loadAndAddAppServices: function(container, callback) {

        var that = this;
        var services = container.Public.getConfig('base').appServices;
        for (var i = 0; i < Object.keys(services).length; i++) {
            var serviceName = Object.keys(services)[i];
            var serviceStatus = services[Object.keys(services)[i]];
            if (serviceStatus) {
                var service = container.Private.requireAppService(serviceName)(container);
                container.Create.addService(service.name, service.service);
            }
        }
        callback();

    },

    getPackageName: function(file, subDir) {

        var that = this;
        var norm = that.path.normalize(file);
        norm = norm.replace(/\\/g, "/").replace('//', '/');
        var tags = norm.split('/');
        var index = tags.indexOf(subDir);
        return tags[index - 1];

    }

};