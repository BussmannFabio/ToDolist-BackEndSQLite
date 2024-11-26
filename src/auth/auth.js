import express from 'express'
import sqlite3 from 'sqlite3'
import crypto from 'crypto'

const router = express.Router()

const loginUser = (req, res) => {
  const db = new sqlite3.Database('./banco.db')
  const { username, email, senha } = req.body

  const hashSenha = (senha, salt) => crypto.pbkdf2Sync(senha, salt, 10000, 64, 'sha256').toString('hex')

  if (!username && !email) {
    return res.status(400).json({ error: "É necessário fornecer um email ou username" })
  }

  const query = "SELECT * FROM users WHERE username = ? OR email = ?"

  db.get(query, [username, email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao verificar o usuário" })
    }

    if (!row) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    const senhaHash = hashSenha(senha, row.salt)

    if (senhaHash !== row.senha) {
      return res.status(401).json({ error: "Senha incorreta" })
    }

    res.status(200).json({
      message: "Login bem-sucedido"
    })
  })
}
router.post('/', loginUser)
export default router
