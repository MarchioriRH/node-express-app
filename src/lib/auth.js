module.exports = {
    isLoggedIn(req, res, next) {
        // isAuthenticated es un metodo de passport que devuelve true si el usuario esta autenticado
        if (req.isAuthenticated()) { 
            return next();
        }
        return res.redirect('/signin');
    },
    // Si el usuario no esta autenticado, se ejecuta next() y se redirige a la pagina principal
    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } 
        return res.redirect('/dashboard');  
    },
    // Si el usuario es un administrador, se ejecuta next() y se redirige a la pagina de administrador
    isAdmin(req, res, next) {
        if (req.user.role === 'admin') {
            return next();
        }
        return res.redirect('/dashboard');
    }
};