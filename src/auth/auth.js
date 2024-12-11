import express from 'express'
import sqlite3 from 'sqlite3'
import crypto from 'crypto'

const router = express.Router()
const db = new sqlite3.Database('./banco.db')

const loginUser  = (req, res) => {
  const { username, email, senha } = req.body

  if (!username && !email) {
    return res.status(400).json({ error: "É necessário fornecer um email ou username" })
  }

  const query = "SELECT * FROM users WHERE username = ? OR email = ?"
  db.get(query, [username, email], (err, row) => {
    if (err || !row) {
      return res.status(err ? 500 : 404).json({ error: err ? "Erro ao verificar o usuário" : "Usuário não encontrado" })
    }

    const senhaHash = crypto.pbkdf2Sync(senha, row.salt, 10000, 64, 'sha256').toString('hex')
    if (senhaHash !== row.senha) {
      return res.status(401).json({ error: "Senha incorreta" })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const checkTokenQuery = "SELECT * FROM tokens WHERE email = ?"

    db.get(checkTokenQuery, [row.email], (err, tokenRow) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao verificar token existente" })
      }

      console.log("Preparando para salvar token:")
      console.log("Email:", row.email)
      console.log("Token:", token)

      const queryToExecute = tokenRow 
        ? "UPDATE tokens SET token = ? WHERE email = ?" 
        : "INSERT INTO tokens (email, token) VALUES (?, ?)"

      db.run(queryToExecute, tokenRow ? [token, row.email] : [row.email, token], (err) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao gerar ou atualizar o token" })
        }

        console.log("Resposta de login:", {
          message: tokenRow ? "Login bem-sucedido - Token atualizado" : "Login bem-sucedido",
          token: token,
          email: row.email
        })

        res.status(200).json({
          message: tokenRow ? "Login bem-sucedido - Token atualizado" : "Login bem-sucedido",
          token: token,
          email: row.email
        })
      })
    })
  })
}

router.post('/', loginUser)

export default router
