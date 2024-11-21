import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()
const port = 3005

const db = new sqlite3.Database('./banco.db')

const validateUser = (req, res, next) => {
  const { name, email, age, registered_date, country, username } = req.body

    if (!name || typeof name !== 'string' || !name.trim().includes(' '))
      return res.status(500).json({ error: "Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles" })
    
    if (!age || isNaN(age) || age < 8 || age > 120)
      return res.status(500).json({ error: "Idade inválida. A idade deve ser um número entre 8 e 120 anos" })
   
    if (!registered_date || typeof registered_date !== 'string' || registered_date.length !== 10)
      return res.status(500).json({ error: "Data inválida. A data deve ser uma string com 8 caracteres" })
   
    if (!username || typeof username !== 'string' || username.length < 6)
      return res.status(500).json({ error: "Username inválido. Deve ser uma string com pelo menos 6 caracteres" })
   
    if (email && typeof email !== 'string')
      return res.status(500).json({ error: "Email inválido" })
   
    if (country && typeof country !== 'string')
      return res.status(500).json({ error: "País inválido" })

  next()
}

const createUser = (req, res) => {
  const { name, age, email, country, username } = req.body

  const insertQuery = `
    INSERT INTO users (name, email, username, age, country, registered_date)
    VALUES (?, ?, ?, ?, ?, GETDATE())
  `

  const params = [name, email, username, age, country]

  db.run(insertQuery, params, function (err) {
    if (err)
      return res.status(500).json({ error: "Erro ao criar o usuário" })

    const maxIdQuery = `SELECT MAX(id) AS id_max FROM users`

    db.get(maxIdQuery, (err, row) => {
      if (err)
        return res.status(500).json({ error: "ERRo" })

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        userId: row.id_max,
      })
    })
  })
}

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

app.get('/', helloDev)
app.get('/users', users)
app.post('/users', validateUser, createUser)
app.get('/users/search', checkingQuery, executeQuery)
app.use(express.json())

app.listen(port, '0.0.0.0', () => console.log(`Servidor rodando na porta: ${port}`))