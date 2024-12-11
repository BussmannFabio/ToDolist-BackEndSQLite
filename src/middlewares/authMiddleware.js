import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./banco.db')

const authenticateUser = (req, res, next) => {
  // token e o email nos headers
  const token = req.headers['authorization']?.split(' ')[1]  //token após 'Bearer'
  const email = req.headers['x-email']

  if (!token || !email) {
    return res.status(401).json({ error: 'Token ou email não fornecido' })
  }

  const query = "SELECT * FROM tokens WHERE email = ? AND token = ?"
  
  db.get(query, [email, token], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }

    req.userEmail = row.email 
    next() 
  })
}

export { authenticateUser }
