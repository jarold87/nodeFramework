const fs = require('fs');
const walk = require('walk');
const path = require('path');
const lupus = require('lupus');
const async = require('async');

var fileUtils = {};

fileUtils.getFilesFromDir = (dir) => {
    return new Promise((resolve, reject) => {
        let filesToReturn = [];

        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }

            lupus(0, files.length, (fileIndex) => {
                let file = path.resolve(dir, files[fileIndex]);

                fs.stat(file, (err, stats) => {
                    if (err) {
                        reject(err);
                    }

                    if (!stats.isDirectory()) {
                        filesToReturn.push({
                            name: files[fileIndex],
                            path: file
                        });
                    }
                });
            }, () => resolve(filesToReturn));

        });
    });
};

fileUtils.getSubdirsMatching = (dir, pattern) => {

    return new Promise((resolve, reject) => {
        let subdirs = [];

        let regexp = new RegExp(pattern, 'g');

        let walker = walk.walk(dir, {followLinks: false});

        walker.on('directory', (root, dirStat, next) => {
            if (dirStat.name.match(regexp)) {
                subdirs.push(path.resolve(root, dirStat.name));
            }
            next();
        });

        walker.on('end', () => resolve(subdirs));
    });

};

fileUtils.getFilesFromSubdirsMatching = (dir, pattern) => {

    return fileUtils.getSubdirsMatching(dir, pattern).then((subdirs) => {
        return new Promise((resolve, reject) => {
            let filesToReturn = [];

            async.eachSeries(subdirs, (subdir, callback) => {
                fileUtils.getFilesFromDir(subdir).then((files) => {
                    filesToReturn = filesToReturn.concat(files);
                    callback();
                });
            }, () => {
                resolve(filesToReturn);
            });
        });
    });

};

module.exports = fileUtils;