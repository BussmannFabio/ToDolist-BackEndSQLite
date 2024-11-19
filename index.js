import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()
const port = 3005

const db = new sqlite3.Database('./banco.db')

const helloDev = (req, res) => res.send('Hello Dev')

const users = (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).send("Erro ao executar a consulta!")
    res.json(rows)
  })
}

const checkingQuery = (req, res, next) => {
  const {
    id, age, id_maiorq, id_menorq, age_maiorq, age_menorq
  } = req.query

    if (id && id_maiorq) return res.status(501).send("Impossível buscar por: id e id_maiorq ao mesmo tempo!")
    if (id && id_menorq) return res.status(501).send("Impossível buscar por: id e id_menorq ao mesmo tempo!")

    if (age && age_maiorq) return res.status(501).send("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
    if (age && age_menorq) return res.status(501).send("Impossível buscar por: age e age_menorq ao mesmo tempo!")

  next()

}

const executeQuery = (req, res) => {
  const {
    id, name, email, username, age, country,
    id_maiorq, id_menorq, age_maiorq, age_menorq, page = 1, limite = 5, sortBy = 'id', order = 'asc'
  } = req.query

  let query = "SELECT * FROM users WHERE"
  let primeiraCondição = true

  
  const addCondition = (condition) => {
    if (primeiraCondição) {

      query += ` ${condition}`
      primeiraCondição = false

    } else {

      query += ` AND ${condition}`

    }
  }

    if (id) addCondition(`id = ${id}`)
    if (id_maiorq) addCondition(`id > ${id_maiorq}`)
    if (id_menorq) addCondition(`id < ${id_menorq}`)

    if (name) addCondition(`name LIKE '%${name}%'`)
    if (email) addCondition(`email LIKE '%${email}%'`)
    if (username) addCondition(`username LIKE '%${username}%'`)
    if (country) addCondition(`country LIKE '%${country}%'`)

    if (age) addCondition(`age = ${parseInt(age)}`)
    if (age_maiorq) addCondition(`age > ${parseInt(age_maiorq)}`)
    if (age_menorq) addCondition(`age < ${parseInt(age_menorq)}`)

    query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`

    const offset = (page - 1) * limite
    
    query += ` LIMIT ${limite} OFFSET ${offset}`

    db.all(query, (err, rows) => {

      if (err) return res.status(500).send("Erro ao executar a consulta!")
      res.json(rows)

  })
  
}

app.get('/', helloDev)
app.get('/users', users)
app.get('/users/search', checkingQuery, executeQuery)

app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta: ${port}`))