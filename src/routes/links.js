const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        title,
        url,
        description
    };
    // console.log(newLink);
    // console.log(pool);
    await pool.query('INSERT INTO links set ?', [newLink]);
    //req.flash('success', 'Link saved successfully');
    //res.redirect('/links');
    res.send('received');
});

module.exports = router;