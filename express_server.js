var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = { shortID: { creator: "", longURL: "" } };
// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

//helper functions
//generates random string
function generateRandomString(x) {
  return [...Array(x)].map(i => (~~(Math.random() * 36)).toString(36)).join('');
}

//Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

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

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

//redirects to long url associated with short url
app.get('/u/:shortURL', (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

