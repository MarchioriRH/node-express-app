const { format, register } = require('timeago.js');

register('es_ES', (number, index, total_sec) => [
    ['justo ahora', 'ahora mismo'],
    ['hace %s segundos', 'en %s segundos'],
    ['hace 1 minuto', 'en 1 minuto'],
    ['hace %s minutos', 'en %s minutos'],
    ['hace 1 hora', 'en 1 hora'],
    ['hace %s horas', 'in %s horas'],
    ['hace 1 dia', 'en 1 dia'],
    ['hace %s dias', 'en %s dias'],
    ['hace 1 semana', 'en 1 semana'],
    ['hace %s semanas', 'en %s semanas'],
    ['1 mes', 'en 1 mes'],
    ['hace %s meses', 'en %s meses'],
    ['hace 1 año', 'en 1 año'],
    ['hace %s años', 'en %s años']
][index]);

const helpers = {
    // Funcion para formatear la fecha
    timeago: function (timestamp) {
        return format(timestamp, 'es_ES');
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