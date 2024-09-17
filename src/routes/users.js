const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../lib/auth');

const pool = require('../database');
const helpers = require('../lib/helpers');

// router.get('/add', isLoggedIn, (req, res) => {
//     res.render('users/add');
// });

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
    const { role, status, isnew } = req.body;
    console.log('params: ', req.params);
    console.log('body: ', req.body);

    const newUser = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    newUser[0].role = role;
    newUser[0].status = status;
    if (newUser[0].isnew === 1) {
        //console.log('status: ', newUser.status);
        newUser[0].isnew = 0;
        // if (status === 'activo') {
        //     helpers.sendConfirmationEmail(newUser[0].email);
        // }
    }

    try {
        console.log('newUser: ', newUser);
        await pool.query('UPDATE users set ? WHERE id = ?', [newUser[0], id]);
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