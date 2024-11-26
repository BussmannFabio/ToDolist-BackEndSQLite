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
        expect(res.text).toBe("Impossível buscar por: id e id_maiorq ao mesmo tempo!")
    })

    it('Deve retornar 400 se for especificado id e id_menorq', async () => {
        const res = await request(app).get('/users/search?id=1&id_menorq=10')
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: id e id_menorq ao mesmo tempo!")
    })

    it('Deve retornar 400 se for especificado age e age_menorq', async () => {
        const res = await request(app).get('/users/search?age=1&age_menorq=10')
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: age e age_menorq ao mesmo tempo!")
    })

    it('Deve retornar 400 se for especificado age e age_maiorq', async () => {
        const res = await request(app).get('/users/search?age=1&age_maiorq=10')
        expect(res.statusCode).toEqual(400)
        expect(res.text).toBe("Impossível buscar por: age e age_maiorq ao mesmo tempo!")
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
            name: 'João Filva',
            email: 'joao.filva' + Date.now() + '@example.com', 
            username: 'joao' + Date.now(),  
            age: 30,
            country: 'Brasil',
            senha: 'Brasil'
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
        const newUser = {
            name: 'João',  
            email: 'joao.filva' + Date.now() + '@example.com',  
            username: 'joao' + Date.now(),  
            age: 30,
            country: 'Brasil',
        }

        const res = await request(app).post('/users').send(newUser)

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles")
    })

    it('Deve retornar 400 se a idade não for válida (fora do intervalo 8-120 e valor tipo number)', async () => {
        const newUser = {
            name: 'João Filva',
            email: 'joao.filva' + Date.now() + '@example.com',  
            username: 'joao' + Date.now(),  
            age: "32",  
            country: 'Brasil',
        }

        const res = await request(app).post('/users').send(newUser)

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Idade inválida. A idade deve ser um número entre 8 e 120 anos")
    })
    
    it('Deve retornar 400 se o nome de usuário for inválido (menos de 6 caracteres)', async () => {
        const newUser = {
            name: 'João Filva',
            email: 'joao.filva' + Date.now() + '@example.com',  
            username: 'joa',  
            age: 30,
            country: 'Brasil',
        }

        const res = await request(app).post('/users').send(newUser)

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Username inválido. Deve ser uma string com pelo menos 6 caracteres")
    })

    it('Deve retornar 400 se o email não for válido', async () => {
        const newUser = {
            name: 'João Filva',
            email: 'joao.Tilva' + Date.now(), 
            username: 'joao23' + Date.now(),
            age: 30,
            country: 'Brasil',
        }
    
        const res = await request(app).post('/users').send(newUser)
    
        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Email inválido")
    })
    

    it('Deve retornar 400 se o país não for válido', async () => {
        const newUser = {
            name: 'João Filva',
            email: 'joao.filva' + Date.now() + '@example.com',  
            username: 'joao23' + Date.now(),
            age: 30,
            country: 12345 
        }

        const res = await request(app).post('/users').send(newUser)

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("País inválido")
    })
})


describe('Testando rota POST /login', () => {

  afterEach(async () => {
    const res = await request(app).get('/users/search')
    if (res.body && res.body.length) {
        for (const user of res.body) {
            await request(app).delete(`/users/${user.id}`)
        }
    }
  })

  it('Deve realizar login com sucesso quando username e senha estiverem corretos', async () => {
    const newUser = {
      username: 'joao123',
      senha: 'senha123'
    }

    await request(app).post('/users')
      .send({
        name: 'João Silva',
        email: 'joao.silva@example.com',
        username: newUser.username,
        age: 30,
        country: 'Brasil',
        senha: newUser.senha
      })

    const res = await request(app)
      .post('/login')
      .send({
        username: newUser.username,
        senha: newUser.senha
      })

    expect(res.statusCode).toEqual(200)
    expect(res.body.message).toBe('Login bem-sucedido')
  })

  it('Deve retornar 401 se a senha estiver incorreta', async () => {
    const newUser = {
      username: 'joao123',
      senha: 'senhaErrada'
    }

    const res = await request(app)
      .post('/login')
      .send({
        username: newUser.username,
        senha: newUser.senha,
      })

    expect(res.statusCode).toEqual(401)
    expect(res.body.error).toBe('Senha incorreta')
  })

  it('Deve retornar 404 se o usuário não for encontrado', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'usuarioInexistente',
        senha: 'qualquerSenha'
      })

    expect(res.statusCode).toEqual(404)
    expect(res.body.error).toBe('Usuário não encontrado')
  })

})