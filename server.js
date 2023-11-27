/********************************************************************************
 *  WEB322 – Assignment 06
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Nguyen Huu Linh Student ID: 118197227 Date: Nov 27 2023
 *
 * Published URL: https://important-lime-leotard.cyclic.app/
 *
 ********************************************************************************/

// Importing required modules
const express = require('express');
const legoData = require('./modules/legoSets');
const clientSessions = require('client-sessions');
const authData = require('./modules/auth-service');
const app = express();
const port = 8080;

// Configuring the app to use EJS as the view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  clientSessions({
    cookieName: 'session',
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr',
    duration: 24 * 60 * 60 * 1000, // Session duration - 1 day
    activeDuration: 1000 * 60 * 5, // Active session extension - 5 minutes
  })
);

// Middleware to ensure user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}
// Middleware to make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
// Initialize data modules
legoData.initialize()
  .then(authData.initialize) // Initialize authData
  .then(() => {
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
  });

// Home page route
app.get('/', (req, res) => {
  res.render('home');
});

// About page route
app.get('/about', (req, res) => {
  res.render('about');
});

// Login page route
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: null });
});

// POST /login
app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/lego/sets');
    })
    .catch(err => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});

// Registration page route
app.get('/register', (req, res) => {
  res.render('register', { errorMessage: null });
});

// POST /register
app.post('/register', (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch(err => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});

// GET /logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

// GET /userHistory
app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});



// LEGO sets listing route
app.get('/lego/sets', (req, res) => {
  if (req.query.theme) {
    legoData
      .getSetsByTheme(req.query.theme)
      .then((sets) => res.render('sets', { sets }))
      .catch((error) =>
        res
          .status(404)
          .render('404', { message: 'No sets found for the specified theme.' })
      );
  } else {
    legoData
      .getAllSets()
      .then((sets) => res.render('sets', { sets }))
      .catch((error) =>
        res.status(404).render('404', { message: 'Unable to load sets.' })
      );
  }
});

// Route for specific LEGO set details
app.get('/lego/sets/:set_num', (req, res) => {
  legoData
    .getSetByNum(req.params.set_num)
    .then((set) => res.render('set', { set }))
    .catch((error) =>
      res
        .status(404)
        .render('404', {
          message: 'No set found for the specified set number.',
        })
    );
});

// Route for adding a new LEGO set (protected)
app.get('/lego/addSet', ensureLogin, (req, res) => {
  legoData
    .getAllThemes()
    .then((themes) => res.render('addSet', { themes }))
    .catch((err) => res.status(500).render('500', { message: err.message }));
});

// Submitting a new LEGO set (protected)
app.post('/lego/addSet', ensureLogin, (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => res.redirect('/lego/sets'))
    .catch((err) => res.status(500).render('500', { message: err.message }));
});

// Editing an existing LEGO set (protected)
app.get('/lego/editSet/:num', ensureLogin, async (req, res) => {
  try {
    const setData = await legoData.getSetByNum(req.params.num);
    const themes = await legoData.getAllThemes();
    res.render('editSet', { themes, set: setData });
  } catch (err) {
    res.status(404).render('404', { message: err.message });
  }
});

// Submitting an edited LEGO set (protected)
app.post('/lego/editSet', ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', {
      message: `I'm sorry, but we have encountered the following error: ${err}`,
    });
  }
});

// Deleting a LEGO set (protected)
app.get('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  legoData
    .deleteSet(req.params.num)
    .then(() => res.redirect('/lego/sets'))
    .catch((err) =>
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

// 404 - Page Not Found route
app.use((req, res) => {
  res.status(404).render('404', {
    message: "The page you're looking for doesn't exist or has been moved.",
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
