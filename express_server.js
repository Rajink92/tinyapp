const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = () => {
  const randomString = Math.random().toString(36).slice(-6);
  return randomString;
};

const generateRandomID = () => {
  const randomID = Math.random().toString(36).slice(-8);
  return randomID;
};

const emailLookupHelper = (email, object) => {
  for (const id in object) {
    if (object[id].email === email) {
      return true;
    }
  }
};

const loginHelper = (email, password, object) => {
  for (const id in object) {
    const passwordCorrect = bcrypt.compareSync(password, object[id].password);
    if (object[id].email === email && passwordCorrect === true) {
      return id;
    }
  }
};
const urlsForUser = (id) => {
  const filteredDatabase = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredDatabase[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredDatabase;
};
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "f6ts3hw2"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "kit5f4sq"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user1@example.com", 
    password: "user1"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "user2"
  }
}
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_ID;
  const userURLs = urlsForUser(userID);
  let templateVars = {
    user: users[userID],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_ID) {
    const userID = req.cookies.user_ID;
    let templateVars = {
      user: users[userID],
      urls: urlDatabase
    };
    res.render("urls-new", templateVars);
  } else {
    res.redirect("/urls/login");
  }
});

app.get("/register", (req, res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies.user_ID;
  let templateVars = {
    user: users[userID],
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_ID;
  const userURLs = urlsForUser(userID);
  let templateVars = {
    user: users[userID],
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
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = req.body.longURL;
  urlDatabase[shortURL].userID = req.cookies.user_ID;
    res.redirect(`./urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.user_ID;
  const userURLs = urlsForUser(userID);
  if (userURLs[req.params.shortURL]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this TinyURL.');
  }
});
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_ID;
  const userURLs = urlsForUser(userID);
  if (userURLs[req.params.shortURL]) {
    urlDatabase[req.params.shortURL].longURL = req.body.updateURL;
    res.redirect("/urls");
  } else {
    res.status(403).send('You do not have access to this TinyURL.');
  }
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
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userID] = {};
  users[userID].id = userID;
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send('Must enter a valid value into field');
  } else if (emailLookupHelper(req.body.email, users)) {
    res.status(400).send('Account already exists');
  } else {
    users[userID].email = req.body.email;
    users[userID].password = hashedPassword;
    res.cookie("user_ID", userID);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp Server running!\nTinyApp app listening on port ${PORT}!`);
});