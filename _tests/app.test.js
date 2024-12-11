import request from 'supertest'  
import app from '../src/app/app.js'

describe('Testando rota GET /users/search', () => {
  it('Deve retornar 200 e os resultados da busca', async () => {
    const res = await request(app).get('/users/search')
    expect(res.statusCode).toEqual(200)
  })

  it('Deve retornar 400 se for especificado id e id_maiorq', async () => {
    const res = await request(app).get('/users/search?id=1&id_maiorq=10')
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe("Impossível buscar por: id e id_maiorq ao mesmo tempo!")
  })

  it('Deve retornar 400 se for especificado id e id_menorq', async () => {
    const res = await request(app).get('/users/search?id=1&id_menorq=10')
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe("Impossível buscar por: id e id_menorq ao mesmo tempo!")
  })

  it('Deve retornar 400 se for especificado age e age_menorq', async () => {
    const res = await request(app).get('/users/search?age=1&age_menorq=10')
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe("Impossível buscar por: age e age_menorq ao mesmo tempo!")
  })

  it('Deve retornar 400 se for especificado age e age_maiorq', async () => {
    const res = await request(app).get('/users/search?age=1&age_maiorq=10')
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
  })
})

describe('Testando rota POST /users', () => {
  afterEach(async () => {
    const res = await request(app).get('/users/search')
    if (res.body && res.body.length) {
      for (const user of res.body) {
        await request(app).delete(`/users/${user.id}`)
      }
    }
  })

  it('Deve retornar 200 e cadastrar o usuário', async () => {
    const newUser = {
      name: 'João Silva',
      email: `joao.silva${Date.now()}@example.com`,
      username: `joao${Date.now()}`,
      age: 30,
      country: 'Brasil',
      senha: 'senha123',
    }

    const postRes = await request(app).post('/users').send(newUser)
    expect(postRes.statusCode).toEqual(200)
    expect(postRes.body.message).toBe('Usuário criado com sucesso')
    expect(postRes.body.userId).toBeDefined()

    const getRes = await request(app).get('/users/last')
    expect(getRes.statusCode).toEqual(200)
    expect(getRes.body).toEqual(expect.objectContaining({
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      age: newUser.age,
      country: newUser.country,
    }))
  })

  it('Deve retornar 400 se o nome for inválido', async () => {
    const baseUser = {
      name: 'João Silva',
      email: `joao.silva${Date.now()}@example.com`,
      username: `joao${Date.now()}`,
      age: 30,
      country: 'Brasil',
      senha: 'senha123',
    }
    const newUser = { ...baseUser, name: 'João' }
    const res = await request(app).post('/users').send(newUser)
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe("Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles")
  })
})

describe('Testando rota POST /login', () => {
  beforeEach(async () => {
    await request(app).post('/users').send({
      name: 'João Silva',
      email: 'joao.silva@example.com',
      username: 'joao123',
      age: 30,
      country: 'Brasil',
      senha: 'senha123',
    })
  })

  afterEach(async () => {
    const res = await request(app).get('/users/search')
    if (res.body && res.body.length) {
      for (const user of res.body) {
        await request(app).delete(`/users/${user.id}`)
      }
    }
  })

  it('Deve realizar login com sucesso usando username', async () => {
    const res = await request(app).post('/login').send({
      username: 'joao123',
      senha: 'senha123',
    })
    expect(res.statusCode).toEqual(200)
    expect(res.body.message).toBe('Login bem-sucedido')
    expect(res.body.token).toBeDefined()
  })

  it('Deve retornar 400 se a senha não for fornecida', async () => {
    const res = await request(app).post('/login').send({ username: 'joao123' })
    expect(res.statusCode).toEqual(400)
    expect(res.body.error).toBe('Senha é obrigatória')
  })

  it('Deve atualizar o token ao realizar login novamente', async () => {
    const firstLogin = await request(app).post('/login').send({ username: 'joao123', senha: 'senha123' })
    const token1 = firstLogin.body.token

    const secondLogin = await request(app).post('/login').send({ username: 'joao123', senha: 'senha123' })
    const token2 = secondLogin.body.token

    expect(secondLogin.statusCode).toEqual(200)
    expect(secondLogin.body.message).toBe('Login bem-sucedido')
    expect(token1).not.toEqual(token2)
  })
})
