const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const urlDatabase = { user: { creator: "", longURL: "" } };


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//helper functions
//generates random string
function generateRandomString(x) {
  return [...Array(x)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
}

//
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//urls routes
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//must go above :id route because it matches the pattern of /:id and get requests are rendered in order
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


//Update URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    urls: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});

//redirects to long url associated with short url
app.get('/u/:shortURL', (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//deletes URL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//Register Routes
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

//Logout Routes
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});











