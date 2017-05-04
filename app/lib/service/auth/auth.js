var basicAuth = require('basic-auth');

var Auth = {

    Property: {
        config: null,
        publicRoutes: []
    },

    Public: {
        setConfig: function (config) {
            Auth.Property.config = config;
        },

        setPublic: function (route) {
            Auth.Property.publicRoutes.push(route);
        },

        use: function (req, res, next) {
            var user = basicAuth(req);
            if (
                !Auth.Private.authIsEnabled()
                || !Auth.Private.isPrivateRoute(req.originalUrl)
            ) {
                return next();
            }
            if (
                Auth.Private.isValidInput(user)
                && Auth.Private.isValidName(user['name'])
                && Auth.Private.isValidPass(user['pass'])
            ) {
                return next();
            }
            return Auth.Private.unauthorized(res);
        }
    },

    Private: {

        authIsEnabled: function () {
            if (Auth.Property.config.enabled) {
                return true;
            }
            return false;
        },

        isPrivateRoute: function (route) {
            for (var i = 0; i < Auth.Property.publicRoutes.length; i++) {
                if (route.match(Auth.Property.publicRoutes[i])) {
                    return false;
                }
            }
            return true;
        },

        isValidInput: function (user) {
            if (!user) {
                return false;
            }
            if (Object.keys(user).indexOf('name') < 0) {
                return false;
            }
            if (Object.keys(user).indexOf('pass') < 0) {
                return false;
            }
            return true;
        },

        isValidName: function (name) {
            if (!name || name != Auth.Property.config.name) {
                return false;
            }
            return true;
        },

        isValidPass: function (pass) {
            if (!pass || pass != Auth.Property.config.pass) {
                return false;
            }
            return true;
        },

        unauthorized: function (res) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            return res.sendStatus(401);
        }

    }

};

module.exports = Auth.Public;