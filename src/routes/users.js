const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../lib/auth');

const pool = require('../database');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('users/add');
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    console.log(users);
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
    const { role, status } = req.body;
    const isnew = 0;
    const newUser = {        
        role,
        status,
        isnew
    };
    try {
        await pool.query('UPDATE users set ? WHERE id = ?', [newUser, id]);
        req.flash('success', 'Usuario actualizado satisfactoriamente');
        res.redirect('/users');
    } catch (error) {
        req.flash('failure', 'Error al actualizar el usuario');
        res.redirect('/users');
    }
});

module.exports = router;