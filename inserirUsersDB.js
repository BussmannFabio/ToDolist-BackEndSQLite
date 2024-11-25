import { db } from './geradorDB.js'
import fs from 'fs'
import crypto from 'crypto'


const dados = JSON.parse(fs.readFileSync('users500.json', 'utf8'))

function hashSenha(senha) {
  return crypto.createHash('sha256').update(senha).digest('hex')
}


db.serialize(() => {
  const insert = db.prepare(`
    INSERT INTO users (id, name, email, username, age, country, registered_date, senha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  dados.users.forEach(user => {
    const senhaHash = hashSenha(user.senha)
    insert.run(user.id, user.name, user.email, user.username, user.age, user.country, user.registered_date || null, senhaHash)
  })

  insert.finalize(() => {
    console.log('Dados inseridos com sucesso!')
    db.close()
  })
})