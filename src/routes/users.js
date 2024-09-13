const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');

const pool = require('../database');

router.get('/add', isLoggedIn, (req, res) => {
    res.render('users/add');
});

// router.post('/add', isLoggedIn, async (req, res) => {
//     const { title, url, description } = req.body;
//     const newLink = {
//         title,
//         url,
//         description
//     };
//     await pool.query('INSERT INTO links set ?', [newLink]);
//     req.flash('success', 'Link saved successfully');
//     res.redirect('/links');
// });

router.get('/', isLoggedIn, async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    console.log(users);
    res.render('users/list', { users });
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    await pool.query('DELETE FROM users WHERE ID = ?', [id]);
    req.flash('success', `Usuario ${users[0].name} eliminado satisfactoriamente`);
    res.redirect('/users');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const users = await pool.query('SELECT * FROM users WHERE ID = ?', [id]);
    console.log(users[0]);
    res.render('users/edit', {user: users[0]});
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const { name, fullname, role, email, status } = req.body;
    const newLink = {
        name,
        fullname,
        role,
        email, 
        status
    };
    await pool.query('UPDATE links set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Usuario actualizado satisfactoriamente');
    res.redirect('/users');
});

module.exports = router;