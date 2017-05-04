function Response(options, statusCode, body, error, runtime) {

    var Property = {
        options: options,
        statusCode: statusCode,
        body: body,
        error: error,
        runtime: runtime,
        parseStrategy: options.getParseStrategy()
    };

    var Public = {

        isSuccess: function () {
            if (Property.statusCode === 200 || Property.statusCode === 302) {
                return true;
            }
            return false;
        },

        getStatusCode: function () {
            return Property.statusCode;
        },

        getBody: function () {
            return Private.getParsedBody();
        },

        getOptions: function () {
            return Property.options;
        },

        getRuntime: function () {
            if (!runtime) {
                return null;
            }
            return Property.runtime[0] + 's ' + Math.floor(Property.runtime[1]/1000000) + 'ms';
        },

        getError: function () {
            return Property.error;
        }

    };

    var Private = {

        getParsedBody: function () {
            if (!Property.parseStrategy) {
                return Property.body;
            }
            return Property.parseStrategy(Property.body);
        }

    };

    return Public;

}

module.exports = Response;