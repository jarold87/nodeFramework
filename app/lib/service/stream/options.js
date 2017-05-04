function Options() {

    var Property = {
        flags: 'w'
    };

    var Public = {

        getOptions: function () {
            return Property;
        },

        useAppend: function () {
            Property.flags = 'a';
        }

    };

    return Public;

}

module.exports = Options;