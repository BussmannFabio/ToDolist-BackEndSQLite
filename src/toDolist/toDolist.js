import express from 'express'
import sqlite3 from 'sqlite3'
import { authenticateUser  } from '../middlewares/authMiddleware.js'

const router = express.Router()
const db = new sqlite3.Database('./banco.db')

const validateTask = (req, res, next) => {
  const { tarefa, status, descricao } = req.body

  if (!tarefa || typeof tarefa !== 'string' || tarefa.length < 1) {
    return res.status(400).json({ error: "A tarefa precisa ter pelo menos um caracter" })
  }

  if (!status || !['Feito', 'Fazendo'].includes(status)) {
    return res.status(400).json({ error: "Status inválido. Deve ser 'Feito' ou 'Fazendo'" })
  }

  if (descricao && typeof descricao !== 'string') {
    return res.status(400).json({ error: "Descrição deve conter texto" })
  }

  next()
}

const createTask = (req, res) => {
  const { tarefa, status, descricao } = req.body
  const owner = req.userEmail 
  
  const insertQuery = `
    INSERT INTO todolist (tarefa, status, descricao, owner)
    VALUES (?, ?, ?, ?)
  `

  db.run(insertQuery, [tarefa, status, descricao || '', owner], function (err) {
    if (err) {
      return res.status(500).json({ error: "Erro ao criar a tarefa" })
    }

    res.status(201).json({
      message: 'Tarefa criada com sucesso',
      taskId: this.lastID
    })
  })
}

const getTasks = (req, res) => {
  const userEmail = req.userEmail 

  db.all('SELECT * FROM todolist WHERE owner = ?', [userEmail], (err, rows) => {
    if (err) return res.status(500).send("Erro ao executar a consulta!")
    res.json(rows)
  })
}

router.post('/', authenticateUser , validateTask, createTask)
router.get('/', authenticateUser , getTasks)

export default router