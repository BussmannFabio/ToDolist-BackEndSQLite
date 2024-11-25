import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./banco.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("Erro ao abrir o banco de dados:", err);
  } else {
    console.log("Banco de dados carregado com sucesso.");
  }
});


db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT,
      username TEXT,
      age INTEGER,
      country TEXT,
      registered_date TEXT DEFAULT (DATE('now'))
    )
  `);
});

console.log("Banco de dados pronto para uso.");
db.close();
