const express = require('express');
const router = express.Router();
const { isLoggedIn, checkRoles } = require('../lib/auth');
const pool = require('../database');
const helpers = require('../lib/helpers');

const { getUserById, handleUserNotFound, updateUserStatus, getUserRoles, getAllUsers } = require('../lib/user-functions.js');

// Rutas
/**
 * Rutas para gestionar usuarios
 * @name Users
 * @category Rutas
 * @path {GET} /users/create Crear usuario
 */
// router.get('/create', isLoggedIn, checkRoles(['admin']), (req, res) => res.render('auth/signup'));



/**
 * @path {POST} /
 */
router.get('/', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    try {
        const users = await getAllUsers();
        for (const user of users) {
            // Obtener los roles de cada usuario
            const userRoles = await getUserRoles(user.id);
            // Guardar los roles del usuario como un array de nombres
            user.roles = userRoles; // Esto almacena los nombres de los roles en un array
        }      
        res.render('users/list', { users }); // Pasamos los usuarios y los roles al template
    } catch (error) {
        console.error('Error retrieving users and roles:', error);
        res.status(500).send('Error retrieving users and roles');
    }
});

router.get('/delete/:id', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    const userToDelete = await getUserById(req.params.id);
    if (!userToDelete) return handleUserNotFound(req, res);

    await pool.query('DELETE FROM users WHERE ID = ?', [req.params.id]);
    req.flash('success', `Usuario ${userToDelete.fullname} eliminado satisfactoriamente`);
    res.redirect('/users');
});

router.get('/activate/:id', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    const userToActivate = await getUserById(req.params.id);
    if (!userToActivate) return handleUserNotFound(req, res);
    const userRoles = await getUserRoles(userToActivate.id);
    res.render('users/activate', { user: req.user, activateUser: userToActivate, roles: userRoles });
});

router.post('/activate/:id', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    await updateUserStatus(req, res, req.params.id, req.body.status);
});

router.get('/edit/:id', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    const userToEdit = await getUserById(req.params.id);
    if (!userToEdit) return handleUserNotFound(req, res);
    const userRoles = await getUserRoles(userToEdit.id);
    res.render('users/edit', { user: req.user, editUser: userToEdit, roles: userRoles });
});

router.post('/edit/:id', isLoggedIn, checkRoles(['admin']), async (req, res) => {
    await updateUserStatus(req, res, req.params.id, req.body.status);
});

router.get('/profile/:id', isLoggedIn, async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return handleUserNotFound(req, res);
    const userRoles = await getUserRoles(user.id);
    res.render('users/profile', { user, userRoles });
});

router.get('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return handleUserNotFound(req, res);    
    res.render('users/profile-edit', { user });
});


router.get('/pending', isLoggedIn, checkRoles(['admin']), async (req, res) => {
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

    await updateUserStatus(req, res, req.params.id, userToEdit.status, newPassword);
});

module.exports = router;
