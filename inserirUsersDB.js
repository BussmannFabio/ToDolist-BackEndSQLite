import sqlite3 from 'sqlite3'
import fs from 'fs'

const db = new sqlite3.Database('./banco.db')

const dados = JSON.parse(fs.readFileSync('users5000.json', 'utf8'))

db.serialize(() => {

  const insert = db.prepare(`
    INSERT INTO users (name, email, username, age, country, senha)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  dados.users.forEach(user => {
    insert.run(user.name, user.email, user.username, user.age, user.country, user.senha)
  })

  insert.finalize(() => {
    console.log('Dados inseridos com sucesso!')
    db.close()
  })
})