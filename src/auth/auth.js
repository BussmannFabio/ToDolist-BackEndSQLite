import express from 'express'
import sqlite3 from 'sqlite3'
import crypto from 'crypto'

const router = express.Router()

const loginUser = (req, res) => {
  const db = new sqlite3.Database('./banco.db')
  const { username, email, senha } = req.body

  if (!username && !email) {
    db.close()
    return res.status(400).json({ error: "É necessário fornecer um email ou username" })
  }

  if (!senha) {
    db.close()
    return res.status(400).json({ error: "Senha é obrigatória" })
  }

  const query = "SELECT * FROM users WHERE username = ? OR email = ?"
  db.get(query, [username, email], (err, row) => {
    if (err || !row) {
      db.close()
      return res.status(err ? 500 : 404).json({ error: err ? "Erro ao verificar o usuário" : "Usuário não encontrado" })
    }

    const senhaHash = crypto.pbkdf2Sync(senha, row.salt, 10000, 64, 'sha256').toString('hex')
    if (senhaHash !== row.senha) {
      db.close()
      return res.status(401).json({ error: "Senha incorreta" })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const checkTokenQuery = "SELECT * FROM tokens WHERE email = ?"

    db.get(checkTokenQuery, [row.email], (err, tokenRow) => {
      if (err) {
        db.close()
        return res.status(500).json({ error: "Erro ao verificar token existente" })
      }

      const queryToExecute = tokenRow
        ? "UPDATE tokens SET token = ? WHERE email = ?"
        : "INSERT INTO tokens (email, token) VALUES (?, ?)"

      db.run(queryToExecute, [token, row.email], (err) => {
        if (err) {
          db.close()
          return res.status(500).json({ error: "Erro ao gerar ou atualizar o token" })
        }

        res.setHeader('Set-Cookie', [
          `token=${token}; HttpOnly; Path=/`,
          `email=${row.email}; HttpOnly; Path=/`
        ])

        res.status(200).json({
          message: tokenRow ? "Login m-sucedido - Token atualizado" : "Login bem-sucedido",
          token: token
        })

        db.close()
      })
    })
  })
}


router.post('/', loginUser)
export default router
