import sqlite3 from 'sqlite3'
const fs = require('fs')

// Ler o arquivo JSON
const dados = JSON.parse(fs.readFileSync('users3k.json', 'utf8'))

const db = new sqlite3.Database('./banco.db', sqlite3.OPEN_CREATE)

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    username TEXT,
    age INTEGER,
    country TEXT
  )
`)

const insert = db.prepare(`
  INSERT INTO users (id, name, email, username, age, country)
  VALUES (?, ?, ?, ?, ?, ?)
`)

dados.users.forEach(user => {
  insert.run(user.id, user.name, user.email, user.username, user.age, user.country)
})

insert.finalize()

console.log("Dados inseridos ")

db.close()