import request from 'supertest'
import app from '../index.js'

describe('Testando rota GET /', () => {
    it('Deve retornar "Hello Dev" na rota /', async () => {
        const res = await request(app).get('/')
        expect(res.statusCode).toEqual(200)
        expect(res.body.message).toEqual('Hello Dev')
    })
})

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
  
    it('Deve retornar 200 e cadastrar o usuário', async () => {
        const newUser  = {
            name: 'João Silva',
            email: 'joao.silva@example.com',
            username: 'joao123',
            age: 30,
            country: 'Brasil',
        }

        const postRes = await request(app).post('/users').send(newUser )

        expect(postRes.statusCode).toEqual(200)
        expect(postRes.body.message).toBe('Usuário criado com sucesso')
        expect(postRes.body.userId).toBeDefined()

        const getRes = await request(app).get('/users/last')

        expect(getRes.statusCode).toEqual(200)
        expect(getRes.body).toEqual(expect.objectContaining({
            name: newUser .name,
            email: newUser .email,
            username: newUser .username,
            age: newUser .age,
            country: newUser .country,
        }))
    })

    it('Deve retornar 400 se o nome for inválido', async () => {
        const newUser  = {
            name: 'João',
            email: 'joao.silva@example.com',
            username: 'joao123',
            age: 30,
            country: 'Brasil',
        }

        const res = await request(app).post('/users').send(newUser )

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Nome inválido. É necessário pelo menos dois nomes com um espaço entre eles")
    })

    it('Deve retornar 400 se a idade não for válida (fora do intervalo 8-120 e valor tipo number)', async () => {
        const newUser  = {
            name: 'João Silva',
            email: 'joao.silva@example.com',
            username: 'joao123',
            age: "32",  
            country: 'Brasil',
        }

        const res = await request(app).post('/users').send(newUser )

        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBe("Idade inválida. A idade deve ser um número entre 8 e 120 anos")
    })
    
    it('Deve retornar 400 se o nome de usuário for inválido (menos de 6 caracteres)', async () => {
        const newUser  = {
            name: 'João Silva',
            email: 'joao.silva@example.com',

            username: 'joa',  

            age: 30,

            country: 'Brasil',

        }


        const res = await request(app).post('/users').send(newUser  )


        expect(res.statusCode).toEqual(400)

        expect(res.body.error).toBe("Username inválido. Deve ser uma string com pelo menos 6 caracteres")

    })


    it('Deve retornar 400 se o email não for válido', async () => {

        const newUser   = {

            name: 'João Silva',

            email: 12345,  

            username: 'joao123',

            age: 30,

            country: 'Brasil',

        }


        const res = await request(app).post('/users').send(newUser  )


        expect(res.statusCode).toEqual(400)

        expect(res.body.error).toBe("Email inválido")

    })


    it('Deve retornar 400 se o país não for válido', async () => {

        const newUser   = {

            name: 'João Silva',

            email: 'joao.silva@example.com',

            username: 'joao123',

            age: 30,

            country: 12345

        }


        const res = await request(app).post('/users').send(newUser  )


        expect(res.statusCode).toEqual(400)

        expect(res.body.error).toBe("País inválido")

    })

})