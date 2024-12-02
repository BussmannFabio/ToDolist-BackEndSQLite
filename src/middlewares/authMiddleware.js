import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./banco.db')

const authenticateUser = (req, res, next) => {
  try {
    const cookies = req.headers.cookie ? req.headers.cookie.split(' ') : []
    const tokenCookie = cookies.find(cookie => cookie.startsWith('token='))
    const emailCookie = cookies.find(cookie => cookie.startsWith('email='))

    if (!tokenCookie || !emailCookie) return res.status(401).json({ error: 'Token ou email não fornecido' })

    const token = tokenCookie.split('=')[1]
    const email = emailCookie.split('=')[1]

    const query = 'SELECT * FROM tokens WHERE email = ? AND token = ?'
    db.get(query, [email, token], (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro interno no servidor' })
      if (!row) return res.status(401).json({ error: 'Token inválido ou expirado' })

      req.userEmail = row.email
      next()
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

export { authenticateUser }
