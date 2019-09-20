const express = require('express');
const unirest = require('unirest');
const fetch = require('node-fetch');
const User = require('../models/User');

const router = express.Router();

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('welcome');
});

// Profile Page
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  // const response = await fetch('https://api.ipify.org/?format=json');
  // const ip = response.json();

  const items = await User.find();
  res.render('dashboard', {
    user: req.user,
    items,
  });
});

module.exports = router;
