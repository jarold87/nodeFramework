process.on('message', function(data) {

    var path = require("path");

    var loadContainer = function(data, callback) {
        var that = this;
        var env = data.env;
        var port = data.port;
        var bootstrap = require(data.bootstrap);
        bootstrap.setServerData({
            cwd: path.dirname(path.dirname(path.dirname(path.dirname(__dirname)))),
            env: env,
            port: port,
            app: null
        });
        bootstrap.bootChildProcess(function(container) {
            callback(container);
        });
    };

    loadContainer(data, function(container) {
        var scriptPath = data.script;
        var args = data.args;
        require(container.getDir('src') + '/' + scriptPath)(container, args, function(m) {
            data['result'] = m;
            process.send(data);
        });
    });

});
