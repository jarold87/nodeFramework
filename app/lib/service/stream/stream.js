var Stream = {

    fs: require("fs"),

    Options: null,

    Public: {

        setOptions: function (Options) {
            Stream.Options = Options;
        },

        createOptions: function () {
            return new Stream.Options();
        },

        createWriteStream: function (file, options, callback) {
            var opt = {};
            if (options && Object.keys(options).length > 0) {
                opt = options.getOptions();
            }
            var stream = Stream.fs.createWriteStream(file, opt);
            stream.on('open', function() {
                callback(stream);
            });
        }

    }

};

module.exports = Stream.Public;