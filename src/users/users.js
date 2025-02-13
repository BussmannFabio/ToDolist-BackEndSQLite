import express from 'express'
import sqlite3 from 'sqlite3'
import crypto from 'crypto'
  
const router = express.Router()
const db = new sqlite3.Database('./banco.db')

const users = (req, res) => {
  const userEmail = req.session.userEmail;
  if (!userEmail) {
    return res.status(401).json({ error: 'Usuário não autenticado' })
  }

  db.all('SELECT * FROM users WHERE email = ?', [userEmail], (err, rows) => {
    if (err) return res.status(500).send("Erro ao executar a consulta!")
    res.json(rows)
  })
}

const checkingQuery = (req, res, next) => {
  const { id, age, id_maiorq, id_menorq, age_maiorq, age_menorq } = req.query

  if (id && id_maiorq) return res.status(400).json({ error: "Impossível buscar por: id e id_maiorq ao mesmo tempo!" })
  if (id && id_menorq) return res.status(400).json({ error: "Impossível buscar por: id e id_menorq ao mesmo tempo!" })

  if (age && age_maiorq) return res.status(400).json({ error: "Impossível buscar por: age e age_maiorq ao mesmo tempo!" })
  if (age && age_menorq) return res.status(400).json({ error: "Impossível buscar por: age e age_menorq ao mesmo tempo!" })

  next()
}

const executeQuery = (req, res) => {
  const {
    id, name, email, username, age, country,
    id_maiorq, id_menorq, age_maiorq, age_menorq, page = 1, limite = 5, sortBy = 'id', order = 'asc'
  } = req.query

  let query = "SELECT * FROM users WHERE 1=1"
  const params = []

  if (id) {
    query += " AND id = ?"
    params.push(parseInt(id))}
    
  if (id_maiorq) {
    query += " AND id > ?"
    params.push(parseInt(id_maiorq))}

  if (id_menorq) {
    query += " AND id < ?"
    params.push(parseInt(id_menorq))}

  if (name) {
    query += " AND name LIKE ?"
    params.push(`%${name}%`)}

  if (email) {
    query += " AND email LIKE ?"
    params.push(`%${email}%`)}

  if (username) {
    query += " AND username LIKE ?"
    params.push(`%${username}%`)}

  if (country) {
    query += " AND country LIKE ?"
    params.push(`%${country}%`) }

  if (age) {
    query += " AND age = ?"
    params.push(parseInt(age))}

  if (age_maiorq) {
    query += " AND age > ?"
    params.push(parseInt(age_maiorq))}

  if (age_menorq) {
    query += " AND age < ?" 
    params.push(parseInt(age_menorq))}

  query += ` ORDER BY ${sortBy} ${order.toUpperCase()}`
  const offset = (page - 1) * limite
  query += " LIMIT ? OFFSET ?"
  params.push(limite, offset)

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao executar a consulta!" })
    res.json(rows)
  })
}

const lastUser = (req, res) => {
  const query = "SELECT * FROM users ORDER BY id DESC LIMIT 1";

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Erro ao buscar o último usuário:', err.message);
      return res.status(500).json({ message: 'Erro ao buscar o último usuário' })
    }

    if (!row) {
      return res.status(404).json({ message: 'Nenhum usuário encontrado' })
    }

    res.status(200).json(row)
  })
}

const validateUser = (req, res, next) => {
  const { name, email, age, country, username } = req.body

  if (email) {
    if (!email.includes('@') || email.length < 5) {
      return res.status(400).json({ error: "Email inválido" })
    }
  }
  
  const query = "SELECT * FROM users WHERE username = ? OR email = ?"

  db.get(query, [username, email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao verificar dados do usuário" })
    }

    if (row) {
      if (row.username === username) {
        return res.status(400).json({ error: "Username já cadastrado" })
      }
      if (row.email === email) {
        return res.status(400).json({ error: "Email já cadastrado" })
      }
    }

    if (!name || typeof name !== 'string' || !name.trim().includes(' '))
      return res.status(400).json({ error: "Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles" })

    if (isNaN(age) || age < 8 || age > 120)
      return res.status(400).json({ error: "Idade inválida. A idade deve ser um número entre 8 e 120 anos" })

    if (!username || typeof username !== 'string' || username.length < 6)
      return res.status(400).json({ error: "Username inválido. Deve ser uma string com pelo menos 6 caracteres" })

    if (country && typeof country !== 'string')
      return res.status(400).json({ error: "País inválido" })

    next()
  })
}


const createUser = (req, res) => {
  const { name, email, age, username, country, senha } = req.body

  const salt = crypto.randomBytes(16).toString('hex')

  // A função crypto.pbkdf2Sync() irá pegar a senha, combiná-la com o salt, e aplicar o SHA-256 com as 10.000 iterações. PBKDF2 (Password-Based Key Derivation Function 2)

  const hashSenha = (senha, salt) => crypto.pbkdf2Sync(senha, salt, 10000, 64, 'sha256').toString('hex')

  const senhaHash = hashSenha(senha, salt)

  const getNextIdQuery = "SELECT MAX(id) AS max_id FROM users"

  db.get(getNextIdQuery, (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao recuperar o maior ID" })
    }

    const newId = (row.max_id || 0) + 1

    const insertQuery = `
      INSERT INTO users (id, name, email, username, age, country, registered_date, salt, senha)
      VALUES (?, ?, ?, ?, ?, ?, DATE('now'), ?, ?)
    `

    db.run(insertQuery, [newId, name, email, username, age, country, salt, senhaHash], function (err) {
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
router.post('/', validateUser, createUser)
router.get('/', users)
router.get('/search', checkingQuery, executeQuery)
router.get('/last', lastUser)

export default router