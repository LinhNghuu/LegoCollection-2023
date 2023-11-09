/********************************************************************************

* WEB322 – Assignment 04

*

* I declare that this assignment is my own work in accordance with Seneca's

* Academic Integrity Policy:

*

* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html

*

* Name: Nguyen Huu Linh Student ID: 118197227 Date: Oct 24 2023

*

* Published URL: https://important-lime-leotard.cyclic.app/

*

********************************************************************************/
// Importing required modules
const express = require('express');
const legoData = require('./modules/legoSets');
const bodyParser = require('body-parser');

// Initializing Express and setting up the port
const app = express();
const port = 8080;

// Setting EJS as the view engine and specifying the public folder for static files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Initializing the lego data
legoData
  .initialize()
  .then(() => {
    // Route for the Home page
    app.get('/', (req, res) => {
      res.render('home');
    });

    // Route for the About page
    app.get('/about', (req, res) => {
      res.render('about');
    });

    // Route for listing lego sets, with optional theme filtering
    app.get('/lego/sets', (req, res) => {
      if (req.query.theme) {
        legoData
          .getSetsByTheme(req.query.theme)
          .then((sets) => res.render('sets', { sets }))
          .catch((error) =>
            res.status(404).render('404', {
              message: 'No sets found for the specified theme.',
            })
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

    // Route for displaying details of a specific lego set by set number
    app.get('/lego/sets/:set_num', (req, res) => {
      legoData
        .getSetByNum(req.params.set_num)
        .then((set) => res.render('set', { set }))
        .catch((error) =>
          res.status(404).render('404', {
            message: 'No set found for the specified set number.',
          })
        );
    });

    // GET route for adding a new set
    app.get('/lego/addSet', (req, res) => {
      legoData
        .getAllThemes()
        .then((themes) => res.render('addSet', { themes }))
        .catch((err) =>
          res.status(500).render('500', { message: err.message })
        );
    });

    // POST route for adding a new set
    app.post('/lego/addSet', (req, res) => {
      legoData
        .addSet(req.body)
        .then(() => res.redirect('/lego/sets'))
        .catch((err) =>
          res.status(500).render('500', { message: err.message })
        );
    });
    // GET Route for Editing a Set
    app.get('/lego/editSet/:num', async (req, res) => {
      try {
        const setData = await legoData.getSetByNum(req.params.num);
        const themes = await legoData.getAllThemes();
        res.render('editSet', { themes, set: setData });
      } catch (err) {
        res.status(404).render('404', { message: err.message });
      }
    });

    // POST Route for Submitting Edit
    app.post('/lego/editSet', async (req, res) => {
      try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect('/lego/sets');
      } catch (err) {
        res.render('500', {
          message: `I'm sorry, but we have encountered the following error: ${err}`,
        });
      }
    });

    // Fallback route for handling 404 errors
    app.use((req, res) => {
      res.status(404).render('404', {
        message: "The page you're looking for doesn't exist or has been moved.",
      });
    });

    // Starting the server
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    // Initialization failure handling
    console.error('Initialization failed:', error);
  });
