import sqlite3 from 'sqlite3'

const criarDB = () => {
  const db = new sqlite3.Database('./banco.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error("Erro ao abrir o banco de dados:", err)
    } else {
      console.log("Banco de dados carregado com sucesso.")
    }
  })

  db.serialize(() => {

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        username TEXT,
        age INTEGER,
        country TEXT,
        registered_date TEXT DEFAULT (DATE('now')),
        senha TEXT
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar a tabela 'users':", err)
      } else {
        console.log("Tabela 'users' criada com sucesso.")
      }
    })

    db.all("PRAGMA table_info(users);", (err, columns) => {
      if (err) {
        console.error("Erro ao verificar colunas:", err)
        return db.close()
      }

      const columnNames = columns.map((col) => col.name)

      if (!columnNames.includes('salt')) {
        db.run(`
          ALTER TABLE users ADD COLUMN salt TEXT;
        `, (err) => {
          if (err) {
            console.error("Erro ao adicionar a coluna 'salt':", err)
          } else {
            console.log("Coluna 'salt' adicionada com sucesso.")
          }
        })
      } else {
        console.log("A coluna 'salt' já existe.")
      }
    })

    db.run(`
      CREATE TABLE IF NOT EXISTS todolist (
        id_task INTEGER PRIMARY KEY AUTOINCREMENT,
        tarefa TEXT NOT NULL,
        status TEXT NOT NULL,
        descricao TEXT,
        owner TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error("Erro ao criar a tabela 'todolist':", err)
      } else {
        console.log("Tabela 'todolist' criada com sucesso.")
      }
    })

    db.close((err) => {
      if (err) {
        console.error("Erro ao fechar o banco de dados:", err)
      } else {
        console.log("Banco de dados fechado com sucesso.")
      }
    })
  })
}

export { criarDB }
