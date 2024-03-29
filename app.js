const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3050;

const users = {};

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_key',
    resave: false,
      saveUninitialized: true 
}));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.send("Username already exists. Please choose a different one.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);           
    users[username] = hashedPassword;
 
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!users[username]) {
        return res.send("Username not found. Please register first.");
    }

    const hashedPassword = users[username];

    const match = await bcrypt.compare(password, hashedPassword);
    if (match) {
        req.session.logged_in = true;
        req.session.username = username;
        return res.redirect('/secured');
    }

    res.send("Incorrect password. Please try again.");
});

app.get('/secured', (req, res) => {
    if (req.session.logged_in) {
        res.send(`Welcome, ${req.session.username}! This is a secured page.`);
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});