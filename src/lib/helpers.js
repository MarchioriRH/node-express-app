const bcrypt = require('bcryptjs');

const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // genera un hash, 10 la cantidad de veces que se va a encriptar
    return await bcrypt.hash(password, salt); // encripta la contraseña basado en el hash y el salt
};

helpers.matchPassword = async (password, savedPassword) => {
    try {
        return await bcrypt.compare(password, savedPassword); // compara la contraseña ingresada con la contraseña encriptada
    } catch (e) {
        console.log(e);
    }
};

module.exports = helpers;