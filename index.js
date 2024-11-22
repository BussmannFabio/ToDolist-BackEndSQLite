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
  const { id, age, id_maiorq, id_menorq, age_maiorq, age_menorq } = req.query

    if (id && id_maiorq) return res.status(400).send("Impossível buscar por: id e id_maiorq ao mesmo tempo!")
    if (id && id_menorq) return res.status(400).send("Impossível buscar por: id e id_menorq ao mesmo tempo!")

    if (age && age_maiorq) return res.status(400).send("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
    if (age && age_menorq) return res.status(400).send("Impossível buscar por: age e age_menorq ao mesmo tempo!")

  next()
}

const executeQuery = (req, res) => {
  const {
    id, name, email, username, age, country,
    id_maiorq, id_menorq, age_maiorq, age_menorq, page = 1, limite = 5, sortBy = 'id', order = 'asc'
  } = req.query

  let query = "SELECT * FROM users WHERE 1=1"

    if (id) query += ` AND id = ${parseInt(id)}`
    if (id_maiorq) query += ` AND id > ${parseInt(id_maiorq)}`
    if (id_menorq) query += ` AND id < ${parseInt(id_menorq)}`

    if (name) query += ` AND name LIKE '%${name}%'`
    if (email) query += ` AND email LIKE '%${email}%'`
    if (username) query += ` AND username LIKE '%${username}%'`
    if (country) query += ` AND country LIKE '%${country}%'`

    if (age) query += ` AND age = ${parseInt(age)}`
    if (age_maiorq) query += ` AND age > ${parseInt(age_maiorq)}`
    if (age_menorq) query += ` AND age < ${parseInt(age_menorq)}`

  query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`

  const offset = (page - 1) * limite
  query += ` LIMIT ${limite} OFFSET ${offset}`

  db.all(query, (err, rows) => {
    if (err) return res.status(500).send("Erro ao executar a consulta!")
    res.json(rows)
  })
}

app.use(express.json())

const validateUser = (req, res, next) => {

  const { name, email, age, country, username } = req.body

  if (!name || typeof name !== 'string' || !name.trim().includes(' '))
    return res.status(400).json({ error: "Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles" })

  if (!age || isNaN(age) || age < 8 || age > 120)
    return res.status(400).json({ error: "Idade inválida. A idade deve ser um número entre 8 e 120 anos" })

  if (!username || typeof username !== 'string' || username.length < 6)
    return res.status(400).json({ error: "Username inválido. Deve ser uma string com pelo menos 6 caracteres" })

  if (email && typeof email !== 'string')
    return res.status(400).json({ error: "Email inválido" })

  if (country && typeof country !== 'string')
    return res.status(400).json({ error: "País inválido" })

  next()
}

const createUser = (req, res) => {
  const { name, email, age, username, country } = req.body

  const getNextIdQuery = `SELECT MAX(id) AS max_id FROM users`

  db.get(getNextIdQuery, (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao recuperar o maior ID" })
    }

    const newId = row.max_id + 1

    const insertQuery = `
      INSERT INTO users (id, name, email, username, age, country, registered_date)
      VALUES (?, ?, ?, ?, ?, ?, DATE('now'))
    `

    db.run(insertQuery, [newId, name, email, username, age, country], function (err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao criar o usuário" })
      }

      res.status(200).json({
        message: 'Usuário criado com sucesso',
        userId: newId,
      })
    })
  })
}



app.get('/', helloDev)
app.get('/users', users)
app.post('/users', validateUser, createUser)
app.get('/users/search', checkingQuery, executeQuery)

app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta: ${port}`))
