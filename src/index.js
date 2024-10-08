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
app.set('views', path.join(__dirname, 'views')); // para que el servidor sepa donde estan las vistas
app.engine('.hbs', exphbs.engine({ // configuracion de handlebars
    defaultLayout: 'main', // layout por defecto
    extname: '.hbs', // extension de los archivos
    layoutsDir: path.join(app.get('views'), 'layouts'), // carpeta donde estan los layouts
    partialDir: path.join(app.get('views'), 'partials'), // carpeta donde estan los partials
    helpers: require('./lib/handlebars'), // funciones de ayuda para handlebars 
}));
app.set('view engine', '.hbs'); // motor de plantillas

// Middleware
app.use(session({
    secret: secret, // clave secreta para la sesion
    resave: false, // para que no se renueve la sesion
    saveUninitialized: false, // para que no se vuelva a guardar la sesion
    rolling: true, // para que la sesion se renueve en cada peticion
    store: new MySQLStore(database), // para guardar la sesion en la base de datos
    cookie: { secure: false, maxAge: 100000 }  // SECURE: false para que funcione en http, maxAge: 60000, tiempo de vida de la sesion
}));
app.use(flash());  // para mostrar mensajes en la vista
app.use(morgan('dev')); // mientras esta en ejecucion la aplicacion muestra mensajes en consola
app.use(express.urlencoded({extended: false})); // para que el servidor entienda los datos que envia un formulario
app.use(express.json()); // para que el servidor entienda los datos que envia un formulario
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
app.use('/users', require('./routes/users'));

// Public
app.use(express.static(path.join(__dirname, 'public'))); // para que la carpeta public sea accesible desde el navegador

// Starting the server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
