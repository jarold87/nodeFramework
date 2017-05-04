var events = require('events');
var http = require('http');

var Http = {

    Property: {
        Response: null,
        Options: null
    },

    Public: {

        setResponse: function (response) {
            Http.Property.Response = response;
        },

        setOptions: function (options) {
            Http.Property.Options = options;
        },

        createOptions: function (host) {
            return new Http.Property.Options(host);
        },

        httpRequest: function (Options, callback) {
            var emitter = Http.Private.createEmitter(Options);
            var req = Http.Private.createRequest(Options, emitter);
            emitter.addListener('response', function (Response) {
                emitter.removeAllListeners();
                return callback(Response);
            });
            emitter.addListener('abort', function (Response) {
                emitter.removeAllListeners();
                req.abort();
                return callback(Response);
            });
        }

    },

    Private: {

        createEmitter: function (Options) {
            var runTimeStart = process.hrtime();
            var emitter = new events.EventEmitter();
            setTimeout(function() {
                emitter.emit('timeout');
            }, Options.getTimeOut());
            emitter.addListener('data', function(code, body, error) {
                emitter.emit('response', Http.Private.createResponse(Options, code, body, error, process.hrtime(runTimeStart)));
            });
            emitter.addListener('timeout', function() {
                emitter.emit('abort', Http.Private.createTimeoutResponse(Options));
            });
            return emitter;
        },

        createRequest: function (Options, emitter) {
            var req = http.request(
                Options.getOptions(),
                function(res) {
                    var reqBody = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        reqBody = reqBody + chunk;
                    });
                    res.on('end', function() {
                        emitter.emit('data', res.statusCode, reqBody, null);
                    });
                }
            );
            if (Options.isPost()) {
                req.write(Options.getPostData());
            }
            req.on('error', function(err) {
                emitter.emit('data', null, null, err);
            });
            req.end();
            return req;
        },

        createResponse: function (options, statusCode, body, error, runtime) {
            return new Http.Property.Response(
                options, statusCode, body, error, runtime
            );
        },

        createTimeoutResponse: function (options) {
            return new Http.Property.Response(
                options, 599, null, 'Timeout: ' + options.getTimeOut(), null
            );
        }

    }

};

module.exports = Http.Public;