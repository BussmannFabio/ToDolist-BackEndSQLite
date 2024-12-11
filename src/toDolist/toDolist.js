import express from 'express'
import sqlite3 from 'sqlite3'
import { authenticateUser } from '../middlewares/authMiddleware.js'

const router = express.Router()
const db = new sqlite3.Database('./banco.db')

const validateTask = (req, res, next) => {
  const { tarefa, status, descricao } = req.body

  if (!tarefa || typeof tarefa !== 'string' || tarefa.length < 1) {
    return res.status(400).json({ error: "A tarefa precisa ter pelo menos um caracter" })
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

const deleteTask = (req, res) => {
  const { taskId } = req.params 
  const owner = req.userEmail  
  const deleteQuery = "DELETE FROM todolist WHERE id_task = ? AND owner = ?"

  db.run(deleteQuery, [taskId, owner], function (err) {
    if (err) {
      console.error("Erro ao deletar a tarefa:", err)
      return res.status(500).json({ error: "Erro ao deletar a tarefa" })
    }
    if (this.changes === 0) {
    
      return res.status(404).json({ error: "Tarefa não encontrada ou não pertence ao usuário" })
    }
    res.status(200).json({ message: "Tarefa removida com sucesso" })
  })
}


const updateTask = (req, res) => {
  const { taskId } = req.params
  const { tarefa, descricao, status } = req.body
  const owner = req.userEmail 

  if (!tarefa || typeof tarefa !== 'string' || tarefa.length < 1) {
    return res.status(400).json({ error: "A tarefa precisa ter pelo menos um caracter" })
  }

  console.log('Dados recebidos:', { taskId, tarefa, descricao, status, owner })

  const updateQuery = `
    UPDATE todolist
    SET tarefa = ?, descricao = ?, status = ?
    WHERE id_task = ? AND owner = ?
  `

  db.run(updateQuery, [tarefa, descricao || '', status, taskId, owner], function (err) {
    if (err) {
      console.error("Erro ao atualizar a tarefa:", err)
      return res.status(500).json({ error: "Erro ao atualizar a tarefa" })
    }

    res.status(200).json({ message: "Tarefa atualizada com sucesso" })
  })
}

router.get('/', authenticateUser , getTasks)
router.post('/', authenticateUser , validateTask, createTask)
router.delete('/:taskId', authenticateUser, deleteTask)
router.put('/:taskId', authenticateUser, updateTask)

export default router
