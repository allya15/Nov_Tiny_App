const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(cookieSession({ name: 'session', secret: 'secret',}));
app.use(bodyParser.urlencoded({ extended: true }));

//helper functions
function generateRandomString(x) {
  return [...Array(x)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
}

function urlsForUser(userID) {
  const userurlDatabase = {};
  if (userID) {
    for (const urlID in urlDatabase) {
      if (urlDatabase[urlID].creator === userID.id) {
        userurlDatabase[urlID] = urlDatabase[urlID].longURL;
      }
    }
    return userurlDatabase;
  }
}

const urlDatabase = { ea29ps: { creator: "", longURL: "" } };
const users = { "": { id: "", email: "", hashedPassword: ""} };

//Home
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//URLs or redirect to home if not logged in
app.get('/urls', (req, res) => {
  const templateVars = {

    urls: urlsForUser(req.session.user_id),
    user: req.session.user_id,
  };
  res.render('urls_index', templateVars);
});

//Login
app.get('/login', (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  res.render('_login', templateVars);
});
app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('No email or password entered');
    return;
  }
  for (const userID in users) {
    const username = users[userID].email;
    const hashedPassword = users[userID].hashedPassword;
    if (username === req.body.email && bcrypt.compareSync(req.body.password, hashedPassword)) {
      req.session.user_id = users[userID];
      res.redirect('/urls?login_success');
      return;
    }
  }

  res.statusCode = 403;
  res.send('Wrong username or password');
  res.redirect('/urls');
});

//Register
app.get('/register', (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  res.render('_register', templateVars);
});
app.post('/register', (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('No email or password entered');
    return;
  }

  for (const account in users) {
    if (users[account].email === req.body.email) {
      res.statusCode = 400;
      res.send('Account already exists');
      return;
    }
  }

  const userID = generateRandomString(8);
  const password = req.body.password;

  users[userID] = {
    id: userID,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(password, 10),
  };

  req.session.user_id = users[userID];
  res.redirect('/urls');
});

//Add URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  if (req.session.user_id) {
    res.render('urls_new', templateVars);
  } else {
    res.statusCode = 403;
    res.redirect('/login?from%new');
  }
});

app.post('/urls/new', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const user = req.session.user_id.id;
  urlDatabase[shortURL] = {
    creator: user,
    longURL: longURL,
  };
  res.redirect('/urls');
});

//update URL
app.get('/urls/:id', (req, res) => {
  if (!req.session.user_id) {
    res.statusCode = 403;
    res.send('Please log in');
  } else if (req.session.user_id.id !== urlDatabase[req.params.id].creator) {
    res.statusCode = 403;
    res.send('Link does not belong to you');
  } else {
    const templateVars = {
      shortURL: req.params.id,
      urls: urlsForUser(req.session.user_id),
      user: req.session.user_id,
    };
    res.render('urls_show', templateVars);
  }
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.newURL;
  res.redirect('/urls');
});

//Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Redirect to longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Delete
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.get('*', (req, res) => {
  res.statusCode = 404;
  res.send('Page not found');
});

app.listen(PORT, () => {
  console.log(`We're live on port ${PORT}!`);
});