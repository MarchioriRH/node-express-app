const { format } = require('timeago.js');

const helpers = {
    // Funcion para formatear la fecha
    timeago: function (timestamp) {
        return format(timestamp);
    },
    // Funcion para comparar dos valores
    eq: function (a, b) {
        return a === b;
    },
    // Funcion para verificar si un valor esta en un array
    contains: function (array, value, options) {
        if (array && array.indexOf(value) !== -1) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    },
    // Funcion para verificar si un valor no esta en un array
    lookup: function (roles, roleId) {
        const role = roles.find(role => role.id === roleId);
        return role ? role.name : '';
    }
};

module.exports = helpers;