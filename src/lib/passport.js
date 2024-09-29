const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const helpers = require('../lib/helpers');
const pool = require('../database');
const { getUserById, getUserRoles, getUserByUsername, getAllUsers } = require('./user-functions');

// se crea una nueva estrategia para el signin
passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // permite recibir mas parametros en la funcion
}, async (req, username, password, done) => {
    const user = await getUserByUsername(username); // se busca el usuario por su nombre
    if (user) { // si se encontro el usuario
        if (user.status === 'inactivo') { // si el usuario esta deshabilitado
            return done(null, false, req.flash('message', 'El usuario no se encuentra habilitado. Por favor, pongase en contacto con el administrador.'));
        }
        // se compara la contraseña ingresada con la contraseña almacenada
        const validPassword = await helpers.matchPassword(password, user.password);
        // si la contraseña es correcta
        if (validPassword) {
            done(null, user, req.flash('success', 'Bienvenido ' + user.username));
        } else {
            done(null, false, req.flash('message', 'El nombre de usuario o la contraseña son incorrectos.'));
        }
        user.roles = await getUserRoles(user.id);
    // si no se encontro el usuario
    } else {
        // se pasa un mensaje de error y un false para el valor de usuario
        return done(null, false, req.flash('message', 'El nombre de usuario no existe.'));
    }
})); 


// se crea una nueva estrategia para el signup
passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const users = await getAllUsers(); // se obtienen todos los usuarios
    if (users.length > 0) { // si el usuario ya existe
        if (users.find(user => user.username === username)) {
            return done(null, false, req.flash('message', 'El nombre de usuario ya existe.'));
        } 
        if (users.find(user => user.email === req.body.email)) {
            return done(null, false, req.flash('message', 'El correo electrónico ya está en uso.'));
        }
    }
    
    if (req.body.password !== req.body.confirm_password) { // si las contraseñas no coinciden
        return done(null, false, req.flash('message', 'Las contraseñas no coinciden.'));
    }

    const { fullname } = req.body;
    const { email } = req.body;
    const status = 'inactivo'; // se establece el estado del usuario
    const isNew = 1;
    const newUser = {
        username,
        password,
        fullname,
        email, 
        status,
        isNew
    };
    try {
        newUser.password = await helpers.encryptPassword(password);
        const result = await pool.query('INSERT INTO users SET ?', [newUser]);
        newUser.id = result.insertId; // se obtiene el id del usuario y se agrega
        return done(null, newUser); // se pasa el usuario para almacenarlo en la sesion
    } catch (error) {
        return done(error);
    }

}));


// Serialización: guarda el ID del usuario en la sesión.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialización: recupera los detalles completos del usuario a partir del ID almacenado.
passport.deserializeUser(async (id, done) => {
    const user = await getUserById(id);
    user.roles = await getUserRoles(id);
    done(null, user);
});