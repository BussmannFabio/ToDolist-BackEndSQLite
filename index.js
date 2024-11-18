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
  let primeiraCondição = true

  if ((id && (id_maiorq))) {
    return res.status(500).send("Impossível buscar por: id e id_maiorq ao mesmo tempo!")
  }

  if ((id && (id_menorq))) {
    return res.status(500).send("Impossível buscar por: id e id_menorq ao mesmo tempo!")
  }

  if ((age && (age_maiorq))) {
    return res.status(500).send("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
  }

  if ((age && (age_menorq))) {
    return res.status(500).send("Impossível buscar por: age e age_menorq ao mesmo tempo!")
  }

  const addCondition = (condition) => {
    if (primeiraCondição) {
      query += ` ${condition}`
      primeiraCondição = false
    } else {
      query += ` AND ${condition}`
    }
  }

  if (id) addCondition(`id = ${id}`);
  if (id_maiorq) addCondition(`id > ${id_maiorq}`)
  if (id_menorq) addCondition(`id < ${id_menorq}`)

  if (name) addCondition(`name = '${name}'`)
  if (email) addCondition(`email = '${email}'`)
  if (username) addCondition(`username = '${username}'`)

  if (age) addCondition(`age = ${parseInt(age)}`)
  if (age_maiorq) addCondition(`age > ${parseInt(age_maiorq)}`)
  if (age_menorq) addCondition(`age < ${parseInt(age_menorq)}`)

  if (country) addCondition(`country = '${country}'`)

  query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`

  const offset = (page - 1) * limite
  query += ` LIMIT ${limite} OFFSET ${offset}`

  console.log(query)

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send("Erro ao executar a consulta!")
    }
    res.json(rows)
  })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta: ${port}`)
})