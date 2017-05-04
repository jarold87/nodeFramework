module.exports = {

    config: {},

    setConfig: function(config) {
        this.config = config;
    },

    sendOk: function(response) {
        this.success(response);
    },

    success: function(response) {
        this.setHeader(response);
        response.status(200);
        response.end(this.config.successText);
    },

    unSuccess: function(response) {
        this.setHeader(response);
        response.status(400);
        response.end(this.config.unSuccessText);
    },

    setHeader: function(response) {
        response.setHeader("Content-Type", this.config.feedContentType);
    }

};