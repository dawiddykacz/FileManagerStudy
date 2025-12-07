const db = require('./config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const getUser = (username) =>{
  return db.prepare("SELECT * FROM users WHERE username = ?").all(username.trim())[0];
}

const userExists = (username) => 
    getUser(username)

const addUser = async (username, password, role = 'user') => {
    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO users (id, username, password_hash, role, created_at) VALUES (?,?,?,?,?)')
    .run(id, username.trim(), hash, role, Math.floor(Date.now()/1000));
};

module.exports = {getUser,userExists,addUser}