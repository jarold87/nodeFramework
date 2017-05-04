/**
 *
 * @constructor
 */
function Config() {

    this.configs = [];

}

Config.prototype.set = function(name, configs) {

    this.configs[name.replace('.json', '').replace('.js', '')] = configs;

};

Config.prototype.get = function(name) {

    if (!this.configs[name]) {
        return null;
    }
    return this.configs[name];

};

Config.prototype.list = function() {

    return Object.keys(this.configs);

};

module.exports = Config;