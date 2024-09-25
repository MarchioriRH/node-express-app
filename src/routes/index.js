const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('auth/signin');
    //res.send('Index page');

});

module.exports = router;