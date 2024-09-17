const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../lib/auth');

const pool = require('../database');
const helpers = require('../lib/helpers');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('users/add');
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
    req.flash('success', `Usuario ${users[0].name} eliminado satisfactoriamente`);
    res.redirect('/users');
});

router.get('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    console.log(users[0]);
    res.render('users/edit', {user: users[0]});
});

router.post('/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { role, status, isnew, email } = req.body;
    
    const newUser = {        
        role,
        status,
        email,
        isnew
    };
    try {
        if (newUser.isnew === 1) {
            console.log('status: ', newUser.status);
            newUser.isnew = 0;
            if (newUser.status === 'activo') {
                helpers.sendConfirmationEmail(newUser.email);
            }
        }
        await pool.query('UPDATE users set ? WHERE id = ?', [newUser, id]);
        req.flash('success', 'Usuario actualizado satisfactoriamente');
        res.redirect('/users');
    } catch (error) {
        req.flash('failure', 'Error al actualizar el usuario');
        res.redirect('/users');
    }
});

router.get('/pending', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users WHERE isnew = 1');
    res.render('users/list', { users });
});

module.exports = router;