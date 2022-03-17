const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = () => {
  const randomString = Math.random().toString(36).slice(-6);
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

const emailLookupHelper = (email, object) => {
  for (const id in object) {
    if (object[id].email === email) {
      return true;
    }
  }
};

const loginHelper = (email, password, object) => {
  for (const id in object) {
    if (object[id].email === email && object[id].password === password) {
      return id;
    } else {
      return undefined;
    }
  }
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req,res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`./urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (emailLookupHelper(req.body.email, users)) {
    const userID = loginHelper(req.body.email, req.body.password, users);
    if (userID) {
      res.cookie("user_ID", userID);
      res.redirect("/urls");
    } else {
      res.status(403).send('Incorrect password for that user account.');
    }
  } else {
    res.status(403).send('No user account with that email address.');
  }
});

app.post("/register", (req, res) => {
  const userID = generateRandomID();
  users[userID] = {};
  users[userID].id = userID;
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send('Must enter a valid value into field');
  } else if (emailLookupHelper(req.body.email, users)) {
    res.status(400).send('Account already exists');
  } else {
    users[userID].email = req.body.email;
    users[userID].password = req.body.password;
    res.cookie("user_ID", userID);
    res.redirect("/urls");
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_ID");;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp Server running!\nTinyApp app listening on port ${PORT}!`);
});