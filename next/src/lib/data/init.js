const db = require('./config/db');
const {addUser,userExists} = require('./users');


module.exports = function init() {
db.exec(`
CREATE TABLE IF NOT EXISTS users (
id TEXT PRIMARY KEY,
username TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role TEXT NOT NULL CHECK(role IN ('user','admin')),
created_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS files (
id TEXT PRIMARY KEY,
owner_id TEXT NOT NULL,
name TEXT NOT NULL,
s3_key TEXT NOT NULL,
created_at INTEGER NOT NULL,
version INTEGER NOT NULL,
visibility TEXT NOT NULL,
FOREIGN KEY(owner_id) REFERENCES users(id)
);


CREATE TABLE IF NOT EXISTS file_acl (
id TEXT PRIMARY KEY,
file_id TEXT NOT NULL,
user_id TEXT NOT NULL,
created_at INTEGER NOT NULL
);


CREATE TABLE IF NOT EXISTS comments (
id TEXT PRIMARY KEY,
file_id TEXT NOT NULL,
author_name TEXT NOT NULL,
content TEXT NOT NULL,
created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS version (
id TEXT PRIMARY KEY,
file_id TEXT NOT NULL,
name TEXT NOT NULL,
version INTEGER NOT NULL,
created_at INTEGER NOT NULL
);
`);


if (!userExists("admin")) {
    addUser("admin","admin","admin")
    console.log('Created default admin: username=admin password=admin');
}
};