module.exports = {

    fs: require("fs"),
    async: require('async'),
    lupus: require('lupus'),
    nodeDir: require('node-dir'),
    path: require("path"),
    es: require('event-stream'),

    readFile: function (file, callback) {

        var content = '';
        var s = this.fs.createReadStream(file)
            .pipe(this.es.split())
            .pipe(this.es.mapSync(function(line){
                s.pause();
                if (line) {
                    content += line + "\n";
                }
                s.resume();
            }).on('error', function(){
                callback('');
            }).on('end', function(){
                callback(content);
            }));

    },

    readDir: function(path, callback) {

        this.fs.readdir(path, function(err, files) {
            callback(files);
        });

    },

    isFile: function(path, callback) {

        this.fs.stat(path, function(err, stats) {
            if (stats.isFile()) {
                callback(true);
            } else {
                callback(false);
            }
        });

    },

    isExist: function(path, callback) {

        this.fs.stat(path, function(err, stats) {
            if (err || stats.size === 0) {
                callback(false, path);
            } else {
                callback(true, path);
            }
        });

    },

    fileIsExist: function (path, callback) {
        this.fs.stat(path, function(err, stats) {
            if (!err && stats.isFile() && stats.size === 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    mapDir: function(dir, callback) {

        var that = this;
        var ret = {};
        that.readDir(dir, function(files) {
            if (!files) {
                callback(ret);
            } else {
                var j = 0;
                that.async.map(files,
                    function(file, callback) {
                        var path = dir + '/' + file;
                        that.isFile(path, function(r) {
                            if (r) {
                                ret[j] = {
                                    name: file,
                                    path: path
                                };
                                j++;
                            }
                            callback();
                        });
                    },
                    function() {
                        callback(ret);
                    }
                );
            }
        });

    },

    subDirs: function(dir, callback) {

        var that = this;
        var ret = {};
        that.readDir(dir, function(files) {
            if (!files) {
                callback(ret);
            } else {
                var j = 0;
                that.async.map(files,
                    function(file, callback) {
                        var path = dir + '/' + file;
                        that.isFile(path, function(r) {
                            if (!r) {
                                ret[j] = {
                                    name: file,
                                    path: path
                                };
                                j++;
                            }
                            callback();
                        });
                    },
                    function() {
                        callback(ret);
                    }
                );
            }
        });

    },

    searchDirs: function(dir, match, callback) {

        var that = this;
        var cDirs = [];
        var q = new RegExp(match, 'g');
        that.nodeDir.subdirs(dir, function(err, subdirs) {
            that.lupus(0, subdirs.length, function(i) {
                if (subdirs[i].match(q)) {
                    cDirs.push(subdirs[i]);
                }
            }, function() {
                callback(cDirs);
            });
        });

    },

    searchFiles: function(dir, match, callback) {

        var that = this;
        var cFiles = [];
        that.searchDirs(dir, match, function(cDirs) {
            that.async.map(cDirs, function(dir, callback) {
                that.mapDir(dir, function(files) {
                    that.lupus(0, Object.keys(files).length, function(i) {
                        cFiles.push(files[i]);
                    }, function() {
                        callback();
                    });
                });
            }, function() {
                callback(cFiles);
            });
        });

    }

};