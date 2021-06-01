const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

////////QUICK NAVIGATION ROUTES//////////
// display shipping info
router.get('/shipping', (req, res) => res.render('shipping'));
//returns
router.get('/returns', (req, res) => res.render('returns'));
//terms& conditions
router.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));
//contact us
router.get('/contact-us', (req, res) => res.render('contact-us'));



module.exports = router;
