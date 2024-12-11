import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./banco.db')

const authenticateUser = (req, res, next) => {
  // Obter o token e o email dos cabeçalhos da requisição
  const token = req.headers['authorization']?.split(' ')[1]  // Obtemos o token após 'Bearer'
  const email = req.headers['x-email']

  if (!token || !email) {
    return res.status(401).json({ error: 'Token ou email não fornecido' })
  }

  // Verificar se o token é válido para o email fornecido
  const query = "SELECT * FROM tokens WHERE email = ? AND token = ?"
  
  db.get(query, [email, token], (err, row) => {
    if (err || !row) {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }

    // Se o token for válido, passamos o email do usuário para a requisição
    req.userEmail = row.email 
    next() 
  })
}

export { authenticateUser }
