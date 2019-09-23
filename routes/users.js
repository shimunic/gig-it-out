const express = require('express');
const ip = require('ip');
const unirest = require('unirest');
const fetch = require('node-fetch');

const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const apiReq = unirest('GET', 'https://community-songkick.p.rapidapi.com/events.json');
const rapidapi = 'https://community-songkick.p.rapidapi.com/events.json';
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Get gigs
router.get('/gigs', ensureAuthenticated, async (req, res) => {
  apiReq.query({
    location: `ip:${ip.address()}`,
    apikey: 'io09K9l3ebJxmxe2',
  });

  apiReq.headers({
    'x-rapidapi-host': 'community-songkick.p.rapidapi.com',
    'x-rapidapi-key': '57bd0f548cmsh5eba061f28d43d3p1b8a9ajsn0e99d213d149',
  });

  const finalLinks = [];
  const finalObj = {};
  apiReq.end(async (resp) => {
    const artistsNames = [];
    const artistsIDs = [];
    if (resp.error) throw new Error(resp.error);

    const upcomingEvents = resp.body.resultsPage.results.event;

    upcomingEvents.forEach((e) => {
      artistsNames.push(e.performance[0].displayName.replace(/\s+/g, '+'));
    }); 
    // .replace(/(.)/g, '+')

    for (let i = 0; i < artistsNames.length; i++) {
      const res = await fetch(encodeURI(`https://music.yandex.ru/handlers/music-search.jsx?text=${artistsNames[i]}`));
      const json = await res.json();
      json.artists.items[0] ? artistsIDs.push(json.artists.items[0].id) : null;
    }
    // artistsIDs.push(json.artists.items[0].id)
    // artistsNames.forEach((e) => {

    //   // const data = respo.json();
    //   // artistsIDs.push(data.artists.items[0].id);
    //   });
    for (let i = 0; i < artistsIDs.length; i++) {
      finalLinks.push(`https://music.yandex.ru/artist/${artistsIDs[i]}`);
    }
    console.log(finalLinks);
    finalObj.array = finalLinks;
    console.log(finalObj);
    res.render('gigs', { finalObj });
  });

  // console.log(upcoming.resultsPage);

  // apiReq.end((response) => {
  //   if (response.error) throw new Error(response.error);

  //   console.log(response.body);
  // });
});

// Register
router.post('/register', (req, res) => {
  const {
    name, email, password, password2,
  } = req.body;
  const errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email }).then((user) => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(() => { // AJFHDGKFJGA
                req.flash(
                  'success_msg',
                  'You are now registered and can log in',
                );
                res.redirect('/users/login');
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
