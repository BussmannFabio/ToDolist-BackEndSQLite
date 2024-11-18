import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()
const port = 3005


const db = new sqlite3.Database('./banco.db')


app.get('/', (req, res) => {
  res.send('Hello Dev')
})

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.log(err)
    }
    res.json(rows)
  })
})

app.get('/users/search', (req, res) => {
  const {
    id, name, email, username, age, country,
    id_maiorq, id_menorq, age_maiorq, age_menorq,
    page = 1, limite = 5, sortBy = 'id', order = 'asc'
  } = req.query

  let query = "SELECT * FROM users"
  const conditions = []

  if (id) conditions.push(`id = ${id}`)
  if (id_maiorq) conditions.push(`id > ${parseInt(id_maiorq)}`)
  if (id_menorq) conditions.push(`id < ${parseInt(id_menorq)}`)

  if (name) conditions.push(`LOWER(name) LIKE '%${name.toLowerCase()}%'`)
  if (email) conditions.push(`LOWER(email) LIKE '%${email.toLowerCase()}%'`)
  if (username) conditions.push(`LOWER(username) LIKE '%${username.toLowerCase()}%'`)

  if (age) conditions.push(`age = ${parseInt(age)}`)
  if (age_maiorq) conditions.push(`age > ${parseInt(age_maiorq)}`)
  if (age_menorq) conditions.push(`age < ${parseInt(age_menorq)}`)

  if (country) conditions.push(`LOWER(country) LIKE '%${country.toLowerCase()}%'`)

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ")
  }

  query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`

  const offset = (page - 1) * limite
  query += ` LIMIT ${limite} OFFSET ${offset}`

  db.all(query, (err, rows) => {
    if (err) {
      console.log("err")
    }
    res.json(rows)
  })
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})