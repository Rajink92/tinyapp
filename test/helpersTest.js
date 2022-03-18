const { assert } = require('chai');
const bcrypt = require('bcryptjs');

const { emailLookupHelper, loginHelper, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("dingleberry-pie", 10)
  }
};

const testURLs = {
  pio1vu:
    { longURL: 'http://www.example.com',
      userID: 'wkc9outf'
    },
  hryn3a:
    { longURL: 'http://www.cats.com',
      userID: 'thnes64'
    }
};

describe('emailLookupHelper', () => {
  it('should return a user with valid email', () => {
    const user = emailLookupHelper("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });

  it('should return undefined if passed non-existent email', () => {
    const user = emailLookupHelper("user4@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});

describe('loginHelper', () => {
  it('should return a user with valid email and password', () => {
    const user = loginHelper("user3@example.com", "dingleberry-pie", testUsers);
    const expectedOutput = "user3RandomID";
    assert.equal(expectedOutput, user);
  });

  it('should return undefined if passed non-existent email', () => {
    const user = loginHelper("user4@example.com", "trogdor-the-burninator", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});

describe('urlsForUser', () => {
  it('should return only the users matching a given user ID', () => {
    const filteredDatabase = urlsForUser('wkc9outf', testURLs);
    const expectedOutput = { pio1vu: { longURL: 'http://www.example.com', userID: 'wkc9outf' } };
    assert.deepEqual(expectedOutput, filteredDatabase);
  });

  it('should return an empty object if no user ID matches', () => {
    const filteredDatabase = urlsForUser('hnehw6w', testURLs);
    const expectedOutput = {};
    assert.deepEqual(expectedOutput, filteredDatabase);
  });
}); 