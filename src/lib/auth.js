module.exports = {
    isLoggedIn(req, res, next) {
        // isAuthenticated es un metodo de passport que devuelve true si el usuario esta autenticado
        if (req.isAuthenticated()) { 
            return next();
        }
        req.flash('message', 'Debe autenticarse para acceder a esta página');
        return res.redirect('/signin');
    },
    // Si el usuario no esta autenticado, se ejecuta next() y se redirige a la pagina principal
    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } 
        return res.redirect('/dashboard');  
    },
   // Chequea si el usuario tiene los roles necesarios para acceder a la pagina
    checkRoles(roles) {
        return function(req, res, next) {
            if (roles.some(role => req.user.roles.includes(role))) {
                return next();
            }            
            req.flash('message', 'No tienes permisos para acceder a esta página');
            return res.redirect('/dashboard');
        }
    }
};