var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// const urlDatabase = { ea29ps: { creator: "", longURL: "" } };
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
app.get("/register", (req, res) => {
  res.render('register', {username: req.cookies["username"]});
});

app.post("/register", (req, res) => {
  if (!email || !password) {
    res.status(400);
    res.send('user not found');
  } else if (email === users.email) {
    res.status(400);
    res.send('user already exists');
  } else {
    let id = generateRandomString(6);
    let newUser = { id, email, password };
    users[id] = newUser;
    res.cookie('id', id);
    res.redirect('/urls');
  }
});


//Login Routes
app.get('/login', (req, res) => {
  let user = users[req.body.user_id];
  const templateVars = { user };
  res.render('_login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
   if (email && password) {
    var user = validateUser(email, password);
    if (user) {
      req.body.user_id = user.id;
      res.redirect('/urls');
      return;
    } else {
      res.status(403).send('Incorrect email or password');
      return;
    };
  }
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
   if (email && password) {

    for (var id in users) {
      if (users[id].email === email) {
        if (users[id].password === password) {
          return users[id];
        }
      }
    }

    var user = validateUser(email, password);
    if (user) {
      req.body.user_id = user.id;
      res.redirect('/urls');
      return;
    } else {
      res.status(403).send('Incorrect email or password');
      return;
    };
  }
});

//Logout Routes
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});















