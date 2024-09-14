const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const helpers = require('../lib/helpers');
const pool = require('../database');

// se crea una nueva estrategia para el signin
passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // permite recibir mas parametros en la funcion
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) { // si se encontro el usuario
        const user = rows[0]; // se obtiene el usuario
        if (user.status === 'inactivo') { // si el usuario esta deshabilitado
            return done(null, false, req.flash('message', 'El usuario aun no ha sido habilitado. Por favor, revise su correo electrónico.'));
        }
        // se compara la contraseña ingresada con la contraseña almacenada
        const validPassword = await helpers.matchPassword(password, user.password);
        // si la contraseña es correcta
        if (validPassword) {
            done(null, user, req.flash('success', 'Bienvenido ' + user.username));
        } else {
            done(null, false, req.flash('message', 'El nombre de usuario o la contraseña son incorrectos.'));
        }
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
    const { fullname } = req.body;
    const { email } = req.body;
    const status = 'inactivo'; // se establece el estado del usuario
    const role = 'usuario'; // se establece el rol del usuario
    const isNew = 1;
    const newUser = {
        username,
        password,
        fullname,
        email, 
        status,
        role, 
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

// se crea una nueva estrategia para el login
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// se deserializa el usuario, o sea, se obtiene el usuario a partir del id
passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
});