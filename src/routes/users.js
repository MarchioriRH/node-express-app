const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../lib/auth');

const pool = require('../database');
const helpers = require('../lib/helpers');

router.get('/create', isLoggedIn, isAdmin, (req, res) => {
    res.render('auth/signup');
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    // console.log(users);
    res.render('users/list', { users });
});

router.get('/delete/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    await pool.query('DELETE FROM users WHERE ID = ?', [id]);
    req.flash('success', `Usuario ${users[0].fullname} eliminado satisfactoriamente`);
    res.redirect('/users');
});

router.get('/pending/activate/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    //console.log("From users, users: ", users[0]);
    const user = users[0];
    res.render('users/activate', {user: user});
});

router.post('/activate/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role, status } = req.body;
    
    await updateUserStatus(req, res, id, role, status);

});

router.get('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    //console.log("From users, users: ", users[0]);
    const user = users[0];
    res.render('users/edit', {user: user});
});

router.post('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role, status } = req.body;
    await updateUserStatus(req, res, id, role, status); 
});

router.get('/pending', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE isnew = 1');
    res.render('users/list', { users });
});

router.get('/profile/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    if (users.length === 0) {
        req.flash('failure', 'Usuario no encontrado');
        res.redirect('/users');
    }
    const user = users[0];    
    res.render('users/profile', { user });
});

router.get('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    if (users.length === 0) {
        req.flash('failure', 'Usuario no encontrado');
        res.redirect('/users');
    }
    const user = users[0];    
    res.render('users/profile-edit', { user });
});

router.post('/profile/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { role, status, password, newPassword, confirmPassword } = req.body;
    if (!helpers.matchPassword(user.password, password)) {
        req.flash('failure', 'Contraseña actual incorrecta');
        res.redirect('/users/profile/edit/' + id);
    }
    if (newPassword !== confirmPassword) {
        req.flash('failure', 'La contraseña nueva y su confirmacion no coinciden');
        res.redirect('/users/profile/edit/' + id);
    }
    await updateUserStatus(req, res, id, role, status, newPassword); 
});


async function updateUserStatus(req, res, id, role, status, newPassword) {
    try {
        const rows = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
        if (rows.length === 0) {
            req.flash('failure', 'Usuario no encontrado');
            res.redirect('/users');
        }
        const user = rows[0];
        user.role = role;
        user.status = status;
        if (newPassword) {
            user.password = await helpers.encryptPassword(newPassword);
        }
        if (user.isnew === 1 && status === 'activo') {
            user.isnew = 0;
            // Verificar si el usuario tiene un correo registrado y si las credenciales son correctas
            // helpers.sendConfirmationEmail(newUser[0].email);            
        }

        await pool.query('UPDATE users set ? WHERE id = ?', [user, id]);
        req.flash('success', 'Usuario actualizado satisfactoriamente');
        const users = await pool.query('SELECT * FROM users WHERE isnew = 1');
        if (users.length === 0) {
            res.redirect('/users');
        } else {
            res.redirect('/users/pending');
        }
    } catch (error) {
        req.flash('failure', 'Error al actualizar el usuario');
        res.redirect('/users');
    }
}

module.exports = router;