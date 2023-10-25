/********************************************************************************
 *  WEB322 – Assignment 04
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Nguyen Huu Linh Student ID: 118197227 Date: Oct 24 2023
 ********************************************************************************/

// Importing required modules
const express = require('express');
const legoData = require('./modules/legoSets');

// Initializing Express and setting up the port
const app = express();
const port = 3000;

// Setting EJS as the view engine and specifying the public folder for static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Initializing the lego data
legoData.initialize().then(() => {
    
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
            legoData.getSetsByTheme(req.query.theme)
                .then(sets => res.render("sets", { sets }))
                .catch(error => res.status(404).render('404', { message: "No sets found for the specified theme." }));
        } else {
            legoData.getAllSets()
                .then(sets => res.render("sets", { sets }))
                .catch(error => res.status(404).render('404', { message: "Unable to load sets." }));
        }
    });

    // Route for displaying details of a specific lego set by set number
    app.get('/lego/sets/:set_num', (req, res) => {
        legoData.getSetByNum(req.params.set_num)
        .then(set => res.render("set", { set }))
        .catch(error => res.status(404).render('404', { message: "No sets found for the specified set number." }));
    });

    // Fallback route for handling 404 errors
    app.use((req, res) => {
        res.status(404).render('404', { message: "The page you're looking for doesn't exist or has been moved." });
    });

    // Starting the server
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });

}).catch(error => {
    // Initialization failure handling
    console.error('Initialization failed:', error);
});

