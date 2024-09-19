const { check } = require('express-validator');

const signinValidation = [
    check('username', 'El nombre de usuario es obligatorio.').notEmpty(),
    check('password', 'La contraseña es obligatoria.').notEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres.').isLength({ min: 6 })
];

const signupValidation = [
    check('username', 'El nombre de usuario es obligatorio.').notEmpty(),
    check('password', 'La contraseña es obligatoria.').notEmpty(),
    check('password', 'La contraseña debe tener al menos 6 caracteres.').isLength({ min: 6 }),
    check('confirm_password', 'La confirmación de la contraseña es obligatoria.').notEmpty(),
    check('fullname', 'El nombre completo es obligatorio.').notEmpty(),
    check('email', 'El correo electrónico es obligatorio.').notEmpty(),
    check('email', 'El correo electrónico no es válido.').isEmail()
];

module.exports = {
    signinValidation,
    signupValidation
};
