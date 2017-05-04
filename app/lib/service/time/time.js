module.exports = {

    tc: require("timezonecomplete"),
    serverTimeZone: null,
    outTimeZone: null,
    defaultPattern: "yyyy-MM-dd HH:mm:ss",

    getServerNow: function() {
        return this.tc.now(this.tc.zone(this.serverTimeZone));
    },

    getNow: function() {
        return this.getServerNow().convert(this.tc.zone(this.outTimeZone));
    },

    getNowToString: function() {
        return this.getNow().format("yyyy-MM-dd HH:mm:ss");
    },

    getNowToUser: function() {
        return this.getNow().format("yyyy.MM.dd. HH:mm");
    },

    getDateTime: function(date) {
        return new this.tc.DateTime(date.toISOString(), this.tc.utc()).convert(this.tc.zone(this.outTimeZone));
    },

    format: function(date, patternConfig) {
        var pattern = this.defaultPattern;
        if (patternConfig) {
            pattern = patternConfig;
        }
        return date.format(pattern);
    },

    subDay: function(date, value) {
        return date.sub(this.tc.days(value));
    },

    getDifference: function (date1, date2) {
        return date1.diff(date2)
    }

};