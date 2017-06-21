module.exports = {

    lupus: require('lupus'),
    path: require("path"),
    async: require('async'),
    file: require('file-service/file.js'),
    config: require(__dirname + '/obj/config.js'),

    serverData: {},

    loadConfigs: function(serverData, callback) {

        var that = this;
        that.serverData = serverData;

        that.async.waterfall([

            function (callback) {
                that.loadBaseConfig(new that.config(), function(Config) { callback(null, Config) });
            },
            function (Config, callback) {
                that.loadEnvConfigs(Config, function(c) { callback(null, c) });
            },
            function (Config, callback) {
                that.loadSrcConfigs(Config, function(c) { callback(null, c) });
            }

        ], function(err, Config) {

            callback(Config);

        });

    },

    loadBaseConfig: function(Config, callback) {

        var that = this;
        var dir = 'config';
        that.file.mapDir(that.fullPath('app/' + dir), function(files) {
            if (Object.keys(files).length > 0) {
                that.lupus(0, Object.keys(files).length, function(i) {
                    var config = require(files[i].path);
                    Config.set(files[i].name, config);
                }, function() {
                    callback(Config);
                });
            } else {
                callback(Config);
            }
        });

    },

    loadEnvConfigs: function(Config, callback) {

        if (this.serverData.env == 'dev') {
            var that = this;
            var dir = 'config/' + that.serverData.env;
            that.file.mapDir(that.fullPath('app/' + dir), function(files) {
                if (Object.keys(files).length > 0) {
                    that.lupus(0, Object.keys(files).length, function(i) {
                        var config = require(files[i].path);
                        var original = Config.get(files[i].name.replace('.json', '').replace('.js', ''));
                        config = that.extend(original, config);
                        Config.set(files[i].name, config);
                    }, function() {
                        callback(Config);
                    });
                } else {
                    callback(Config);
                }
            });
        } else {
            callback(Config);
        }

    },

    loadSrcConfigs: function(Config, callback) {

        var that = this;
        var srcDir = that.fullPath('src');
        that.file.searchFiles(srcDir, 'config', function(files) {
            that.lupus(0, Object.keys(files).length, function(i) {
                var config = require(files[i].path);
                var pN = that.getPackageName(files[i].path, 'config');
                Config.set(pN + '/' + files[i].name, config);
            }, function() {
                callback(Config);
            });
        });

    },

    getPackageName: function(file, subDir) {

        var that = this;
        var norm = that.path.normalize(file);
        norm = norm.replace(/\\/g, "/").replace('//', '/');
        var tags = norm.split('/');
        var index = tags.indexOf(subDir);
        return tags[index - 1];

    },

    extend: function(parent, child) {

        var target = parent;
        for (var i = 0; i < Object.keys(child).length; i++) {
            target[Object.keys(child)[i]] = child[Object.keys(child)[i]];
        }
        return target;

    },

    fullPath: function(dir) {

        return this.path.join(this.serverData.cwd, dir);

    }

};