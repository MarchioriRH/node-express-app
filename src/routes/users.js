const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

// Funciones comunes
/**
 * Funcion para obtener un usuario por su ID
 * @param {*} id 
 * @returns  
 */
async function getUserById(id) {
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    if (users.length === 0) return null;
    return users[0];
}

/**
 * Funcion para manejar el caso en que un usuario no sea encontrado
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
function handleUserNotFound(req, res) {
    req.flash('message', 'Usuario no encontrado');
    return res.redirect('/users');
}

/**
 * Funcion para actualizar el estado de un usuario en la BBDD
 * @param {*} req 
 * @param {*} res 
 * @param {*} id 
 * @param {*} role 
 * @param {*} status 
 * @param {*} newPassword 
 * @returns 
 */
async function updateUserStatus(req, res, id, role, status, newPassword = null) {
    try {
        const user = await getUserById(id);
        if (!user) return handleUserNotFound(req, res);
        
        user.role = role;
        user.status = status;
        if (req.body.fullname) {
            user.fullname = req.body.fullname;
        }    
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (newPassword) {
            user.password = await helpers.encryptPassword(newPassword);
        }
        if (user.isnew === 1 && status === 'activo') {
            user.isnew = 0;
        }

        await pool.query('UPDATE users SET ? WHERE id = ?', [user, id]);

        req.flash('success', 'Usuario actualizado satisfactoriamente');
        const pendingUsers = await pool.query('SELECT * FROM users WHERE isnew = 1');
        res.redirect(pendingUsers.length === 0 ? '/users' : '/users/pending');
    } catch (error) {
        req.flash('message', 'Error al actualizar el usuario');
        res.redirect('/users');
    }
}

// Rutas
/**
 * Rutas para gestionar usuarios
 * @name Users
 * @category Rutas
 * @path {GET} /users/create Crear usuario
 */
router.get('/create', isLoggedIn, isAdmin, (req, res) => res.render('auth/signup'));

/**
 * @path {POST} /
 */
router.get('/', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    res.render('users/list', { users });
});

router.get('/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const userToDelete = await getUserById(req.params.id);
    if (!userToDelete) return handleUserNotFound(req, res);

    await pool.query('DELETE FROM users WHERE ID = ?', [req.params.id]);
    req.flash('success', `Usuario ${userToDelete.fullname} eliminado satisfactoriamente`);
    res.redirect('/users');
});

router.get('/activate/:id', isLoggedIn, isAdmin, async (req, res) => {
    const userToActivate = await getUserById(req.params.id);
    if (!userToActivate) return handleUserNotFound(req, res);

    res.render('users/activate', { user: req.user, activateUser: userToActivate });
});

router.post('/activate/:id', isLoggedIn, isAdmin, async (req, res) => {
    await updateUserStatus(req, res, req.params.id, req.body.role, req.body.status);
});

router.get('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const userToEdit = await getUserById(req.params.id);
    if (!userToEdit) return handleUserNotFound(req, res);

    res.render('users/edit', { user: req.user, editUser: userToEdit });
});

router.post('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    await updateUserStatus(req, res, req.params.id, req.body.role, req.body.status);
});

router.get('/profile/:id', isLoggedIn, async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return handleUserNotFound(req, res);
    
    res.render('users/profile', { user });
});

router.get('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return handleUserNotFound(req, res);
    
    res.render('users/profile-edit', { user });
});


router.get('/pending', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE isnew = 1');
    if (users.length === 0) {
        req.flash('message', 'No hay usuarios pendientes de activacion');
        return res.redirect('/users');
    }
    res.render('users/list', { users });
});

router.post('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const { password, newPassword, confirmPassword } = req.body;
    const userToEdit = await getUserById(req.params.id);
    if (!userToEdit) return handleUserNotFound(req, res);
    
    if (!await helpers.matchPassword(password, userToEdit.password)) {
        req.flash('message', 'Contraseña actual incorrecta');
        return res.redirect(`/users/profile/edit/${req.params.id}`);
    }

    if (newPassword !== confirmPassword) {
        req.flash('message', 'La contraseña nueva y su confirmacion no coinciden');
        return res.redirect(`/users/profile/edit/${req.params.id}`);
    }

    await updateUserStatus(req, res, req.params.id, userToEdit.role, userToEdit.status, newPassword);
});

module.exports = router;
