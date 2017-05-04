/**
 *
 * @constructor
 */
function Service() {

    this.services = [];

}

Service.prototype.set = function(name, service) {

    this.services[name.replace('.js', '')] = service;

};

Service.prototype.get = function(name) {

    if (!this.services[name]) {
        console.log('No service: ' + name);
        return null;
    }
    return this.services[name];

};

Service.prototype.list = function() {

    return Object.keys(this.services);

};

module.exports = Service;