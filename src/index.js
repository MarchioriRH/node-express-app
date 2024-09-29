const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
const nodemailer = require('nodemailer');

const { database, secret } = require('./keys');

// Initialize the app
const app = express();
require('./lib/passport'); //para que se ejecute el archivo passport.js

// Set up the server
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialDir: path.join(app.get('views'), 'partials'),
    helpers: require('./lib/handlebars'),
    helpers: {
        eq: function(a, b) {
            return a === b;
        },
        contains: function(array, value, options) {
            if (array && array.indexOf(value) !== -1) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        lookup: function (roles, roleId) {
            const role = roles.find(role => role.id === roleId);
            return role ? role.name : '';
        },
    }
}));
app.set('view engine', '.hbs');

// Middleware
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
    cookie: { secure: false, maxAge: null }  // SECURE: false para que funcione en http, maxAge: null para que no expire la sesion
                                             // en produccion se debe poner secure: true
}));
app.use(flash());  
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json()); 
app.use(passport.initialize()); //inicializa passport
app.use(passport.session());    //para que passport pueda guardar los datos del usuario en la sesion

// Global variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success'); // crea una variable global success que se puede usar en cualquier vista, req.flash('success') es un mensaje de exito   
    app.locals.message = req.flash('message'); // crea una variable global message que se puede usar en cualquier vista, req.flash('message') es un mensaje de error
    app.locals.user = req.user; // crea una variable global user que se puede usar en cualquier vista, req.user es el usuario autenticado
    next();
});
//console.log(app.locals);

// Routes
app.use(require('./routes'));
app.use(require('./routes/authentication'));
// app.use('/links', require('./routes/links'));
app.use('/users', require('./routes/users'));

// Public
app.use(express.static(path.join(__dirname, 'public')));

// Starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
