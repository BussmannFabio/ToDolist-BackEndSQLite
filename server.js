import app from './src/app/app.js'
import { criarDB } from './geradorDB.js'
const port = 3005

criarDB()

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
})