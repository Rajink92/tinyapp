const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const { emailLookupHelper, loginHelper, urlsForUser } = require('./helpers.js');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["Guinness", "is", "a", "good", "boy"],
  maxAge: 24 * 60 * 60 * 1000
}));

//Functions and Objects

const generateShortUrl = () => {
  const randomString = Math.random().toString(36).slice(-6);
  return randomString;
};

const generateRandomID = () => {
  const randomID = Math.random().toString(36).slice(-8);
  return randomID;
};

// Databse objects

const urlDatabase = {};

const usersDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user1@example.com", 
    password: "user1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "user2"
  },
  "6e0abj": {
    id: "6e0abj",
    email: "testone@gmail.com",
    password: "$2a$10$rejKRGWIZdqnezjr5Xo4ZeAHKueb6Av85MUCz/25LFa//tRirPi.u"
  },
  "94ej19": {
    id: "94ej19",
    email: "gema@gmail.com",
    password: "$2a$10$n0JFMZYbpt.SL9/ydbhLu.Jgb1dxog21H8Rd02jY7ZxtiUcR2n4O2"
  }
}

// Get Requests

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  let templateVars = {
    user: usersDatabase[userID],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const userID = req.session.userID;
    let templateVars = {
      user: usersDatabase[userID],
      urls: urlDatabase
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login");
  }
});

app.get("/register", (req, res) => {
  const userID = req.session.userID;
  let templateVars = {
    user: usersDatabase[userID],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  let templateVars = {
    user: usersDatabase[userID],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  let templateVars = {
    user: usersDatabase[userID],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  const shortURL = generateShortUrl();
  urlDatabase[shortURL] = req.body.longURL;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.session.userID;
    res.redirect(`./urls/${shortURL}`);
});

// Post Requests

app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (userURLs[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.updateURL;
    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this TinyURL.');
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const userURLs = urlsForUser(userID, urlDatabase);
  if (userURLs[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this TinyURL.');
  }
});

app.post("/register", (req, res) => {
  const userID = generateRandomID();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  usersDatabase[userID] = {};
  usersDatabase[userID].id = userID;
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send('Must enter a valid value into field');
  } else if (emailLookupHelper(req.body.email, usersDatabase)) {
    res.status(400).send('Account already exists');
  } else {
    usersDatabase[userID].email = req.body.email;
    usersDatabase[userID].password = hashedPassword;
    req.session.userID = userID;
    res.redirect("/urls");
  }
});
app.post("/login", (req, res) => {
  if (emailLookupHelper(req.body.email, usersDatabase)) {
    const requestPassword = req.body.password;
    let userID;
    if (requestPassword) {
      userID = loginHelper(req.body.email, requestPassword, usersDatabase);
    } else {
      res.status(403).send('Incorrect password for that user account.');
    }
    if (userID) {
      req.session.userID = userID;
      res.redirect("/urls");
    } else {
      res.status(403).send('Incorrect password for that user account.');
    }
  } else {
    res.status(403).send('No user account with that email address.');
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Listeners

app.listen(PORT, () => {
  console.log(`TinyApp Server running!\nTinyApp app listening on port ${PORT}!`);
});