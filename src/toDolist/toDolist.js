import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('banco.db')


db.serialize(() => {

  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='todolist';", (err, row) => {
    if (err) {
      console.error("Erro ao verificar tabela:", err)
      return
    }

    if (!row) {
   
      db.run(`CREATE TABLE todolist (
        id_task INTEGER PRIMARY KEY AUTOINCREMENT,
        tarefa TEXT NOT NULL,
        status TEXT NOT NULL,
        descricao TEXT,
        owner TEXT NOT NULL
      )`, (err) => {
        if (err) {
          console.error("Erro ao criar tabela:", err)
        } else {
          console.log("Tabela 'todolist' criada com sucesso!")
        }
        db.close()
      })

    } else {
      console.log("Tabela 'todolist' já existe.")
      db.close()

    }
  })
})

