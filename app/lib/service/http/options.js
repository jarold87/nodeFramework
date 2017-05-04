function Options(host) {

    var Property = {
        host: host,
        port: 80,
        path: '',
        method: 'GET',
        headers: {}
    };

    var TimeOut = 3000;
    var PostData = {};
    var ParseStrategy = null;

    var Public = {

        getOptions: function () {
            return Property;
        },

        setPort: function (port) {
            Property.port = port;
        },

        setPath: function (path) {
            Property.path = path;
        },

        setPost: function (data) {
            Property.method = 'POST';
            PostData = data;
        },

        setParseStrategy: function (strategy) {
            ParseStrategy = strategy;
        },

        addHeader: function (key, value) {
            Property.headers[key] = value;
        },

        setTimeOut: function (timeOut) {
            TimeOut = timeOut;
        },

        isPost: function () {
            if (Property.method == 'POST') {
                return true;
            }
            return false;
        },

        getPostData: function () {
            return PostData;
        },

        getTimeOut: function () {
            return TimeOut;
        },

        getParseStrategy: function () {
            return ParseStrategy;
        }

    };

    var Private = {

    };

    return Public;

}

module.exports = Options;