const bcrypt = require('bcryptjs');

// Helper Functions

const emailLookupHelper = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
};

const loginHelper = (email, password, database) => {
  for (const userID in database) {
    const passwordCorrect = bcrypt.compareSync(password, database[userID].password);
    if (database[userID].email === email && passwordCorrect === true) {
      return userID;
    }
  }
};

const urlsForUser = (id, database) => {
  const filteredDatabase = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      filteredDatabase[shortURL] = database[shortURL];
    }
  }
  return filteredDatabase;
};

module.exports = { emailLookupHelper, loginHelper, urlsForUser }; 