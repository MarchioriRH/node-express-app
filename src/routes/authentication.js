const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

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
        req.flash('success', 'Registro exitoso. En breve recibirá un correo de confirmación, con una clave de acceso temporal. Por favor, revise su bandeja de entrada, y recuerde cambiar su clave de acceso en su primer inicio de sesión.');
        return res.redirect('/signin'); // o una página de confirmación como '/signup-confirmation'
    })(req, res, next) // next es una funcion que se ejecuta despues de passport.authenticate
}); 

// renderiza el formulario de signin
router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next); // next es una funcion que se ejecuta despues de passport.authenticate
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut(() => {
        res.redirect('/signin');
    });
});

module.exports = router;