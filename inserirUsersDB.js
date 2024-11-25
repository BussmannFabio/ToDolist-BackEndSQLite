import fs from 'fs'
import db from 'banco.db'

const dados = JSON.parse(fs.readFileSync('users500.json', 'utf8'))

db.serialize(() => {
  const insert = db.prepare(`
    INSERT INTO users (id, name, email, username, age, country, registered_date, senha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  dados.users.forEach(user => {

    insert.run(user.id, user.name, user.email, user.username, user.age, user.country, user.registered_date, user.senha)
  })

  insert.finalize(() => {
    console.log('Dados inseridos com sucesso!')
    db.close()
  })
})