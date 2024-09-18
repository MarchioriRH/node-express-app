const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn, isAdmin } = require('../lib/auth');

const pool = require('../database');

router.get('/signup', isNotLoggedIn, (req, res) => {
    res.render('auth/signup');
});

router.post('/signup', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signup', (err, user, info) => {
        if (err) {
            return next(err); // Manejo de errores
        }
        if (!user) {
            return res.redirect('/signup'); // Si el registro falla, redirigir a la misma página de registro
        }
        // Registro exitoso, redirigir a la página de inicio de sesión o confirmación
        req.flash('success', 'Registro exitoso. En breve recibirá un correo de confirmación. Por favor, revise su bandeja de entrada.');
        return res.redirect('/signin'); // o una página de confirmación como '/signup-confirmation'
    })(req, res, next) // next es una funcion que se ejecuta despues de passport.authenticate
}); 

// renderiza el formulario de signin
router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {    
    passport.authenticate('local.signin', {
        successRedirect: '/dashboard',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next); // next es una funcion que se ejecuta despues de passport.authenticate    
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        // Realiza la consulta para obtener todos los usuarios
        const users = await pool.query('SELECT * FROM users');

        // Verifica si hay algún usuario con el atributo isnew == 1
        const hasNewUser = users.some(user => user.isnew === 1);

        // Define el mensaje según el estado de isnew
        if (req.user.role === 'admin') { 
            let message = null;
            if (hasNewUser)  {
                message = 'Hay usuarios nuevos que requieren tu atención.';
            }

            // Renderiza la vista pasando los usuarios y el mensaje
            res.render('dashboard', {
                users,      // Pasa la lista de usuarios
                message     // Pasa el mensaje si es necesario
            });
        } else {
            res.render('dashboard');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar el dashboard de administrador.');  
    }
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut(() => {
        res.redirect('/signin');
    });
});

module.exports = router;