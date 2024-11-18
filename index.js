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
    id_maiorq, id_menorq, age_maiorq, age_menorq, page = 1, limite = 5, sortBy = 'id', order = 'asc'
  } = req.query;

  let query = "SELECT * FROM users WHERE"

  if (id) { query += ` id = ${id}`}

  if (id_maiorq) { query += ` AND id > ${id_maiorq}`}

  if (id_menorq) { query += ` AND id < ${id_menorq}`}

  if (name) { query += ` AND name = '${name}'`}

  if (email) { query += ` AND email = '${email}'`}

  if (username) { query += ` AND username = '${username}'`}

  if (age) { query += ` AND age = ${parseInt(age)}`}

  if (age_maiorq) { query += ` AND age > ${parseInt(age_maiorq)}`}

  if (age_menorq) { query += ` AND age < ${parseInt(age_menorq)}`}

  if (country) { query += ` AND country = '${country}'`}

  query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`
  
  const offset = (page - 1) * limite
  query += ` LIMIT ${limite} OFFSET ${offset}`

  console.log(query)

  res.send(query)
})


app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta: ${port}`)
})