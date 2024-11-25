import db from './geradorDB.js'
import fs from 'fs'

const dados = JSON.parse(fs.readFileSync('users3k.json', 'utf8'))

db.serialize(() => {
  const insert = db.prepare(`
    INSERT INTO users (id, name, email, username, age, country)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  dados.users.forEach(user => {
    insert.run(user.id, user.name, user.email, user.username, user.age, user.country)
  })

  insert.finalize(() => {
    console.log('Dados inseridos com sucesso!')
    db.close()
  })
})
