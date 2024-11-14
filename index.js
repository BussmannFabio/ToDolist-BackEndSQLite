import express from 'express'
import sqlite3 from 'sqlite3'

const app = express()
const port = 3005


const db = new sqlite3.Database('./banco.db')


app.get('/', (req, res) => {
  res.send('Hello Dev')
})


app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.log(err)
    }
    res.json(rows)
  })
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})